import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import { Screen, Title, Card, Heading, Label, Notice, Loading } from "./ui";
import TextField from "./TextField";
import MyButton from "./MyButton";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { useBackHandler } from "./useBackHandler";
import {
  createReceipt,
  DEMO_PROFILE,
  getReceipt,
  updateReceipt,
} from "@/src/services/receiptService";
import {
  AI_ENABLED,
  analyzeReceipt,
  recognizeReceiptText,
} from "@/src/services/receiptAIService";
import {
  CATEGORIES,
  isValidDate,
  parseAmount,
  localDate,
} from "@/src/services/receiptValidation";
import { supabase } from "@/utils/supabase";
const empty = {
  merchant_name: "",
  purchase_date: new Date().toISOString().slice(0, 10),
  subtotal: "",
  sales_tax: "",
  total: "",
  payment_method: "",
  category: "Other",
  notes: "",
};
export default function ReceiptForm({ id }: { id?: string }) {
  const { theme } = useTheme();
  const { session } = useAuth();
  const [form, setForm] = useState(() => ({
    ...empty,
    purchase_date: localDate(),
  }));
  const [image, setImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(!!id);
  const [loadFailed, setLoadFailed] = useState(false);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState("");
  const [processed, setProcessed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const savingRef = useRef(false);
  useBackHandler(dirty, savingRef);
  useEffect(() => {
    if (!id) return;
    let active = true;
    getReceipt(id)
      .then((r) => {
        if (!active) return;
        if (!r) {
          setError("Receipt not found.");
          setLoadFailed(true);
          return;
        }
        setForm({
          merchant_name: r.merchant_name,
          purchase_date: r.purchase_date,
          category: r.category,
          payment_method: r.payment_method,
          subtotal: String(r.subtotal),
          sales_tax: String(r.sales_tax),
          total: String(r.total),
          notes: r.notes || "",
        });
        setImage(r.image_url);
        setProcessed(!!r.ai_processed);
      })
      .catch(() => {
        setLoadFailed(true);
        if (active)
          setError(
            "Could not load this receipt. Please go back and try again.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  function field(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }
  async function pick(camera: boolean) {
    setError("");
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(
            "Allow camera access to photograph a receipt, or choose a photo instead.",
          );
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setMimeType(result.assets[0].mimeType || "image/jpeg");
        setProcessed(false);
        setRaw("");
        setDirty(true);
      }
    } catch {
      setError("The photo could not be opened. Please try again.");
    }
  }
  async function extract(ai: boolean) {
    if (!image) return;
    setBusy(true);
    setError("");
    try {
      if (ai) {
        const r = await analyzeReceipt(image);
        setForm({
          ...r,
          subtotal: String(r.subtotal),
          sales_tax: String(r.sales_tax),
          total: String(r.total),
          notes: r.notes || "",
        });
        setProcessed(true);
        setDirty(true);
        setError(
          "Review every extracted field before saving. Confidence: " +
            r.confidence +
            "%.",
        );
      } else {
        const text = await recognizeReceiptText(image);
        if (!text.trim())
          throw new Error(
            "No text was found. Try a clearer photo or enter the details manually.",
          );
        setRaw(text);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Receipt scanning failed. Manual entry is available.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (savingRef.current) return;
    setError("");
    let amounts;
    try {
      if (!form.merchant_name.trim()) throw new Error("Enter a merchant name.");
      if (!isValidDate(form.purchase_date))
        throw new Error("Enter a valid purchase date as YYYY-MM-DD.");
      amounts = {
        subtotal: parseAmount(form.subtotal),
        sales_tax: parseAmount(form.sales_tax),
        total: parseAmount(form.total),
      };
      if (amounts.sales_tax > amounts.total)
        throw new Error("Sales tax cannot exceed the receipt total.");
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      let imageURL = image;
      const local = id ? id.startsWith("local-") : !session;
      if (
        image &&
        !image.startsWith("https://") &&
        !image.startsWith("http://")
      ) {
        if (local) {
          if (!image.startsWith("data:")) {
            if (Platform.OS === "web") {
              const blob = await (await fetch(image)).blob();
              imageURL = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } else {
              const file = new File(
                Paths.document,
                "receipt-" +
                  Date.now() +
                  (mimeType === "image/png"
                    ? ".png"
                    : mimeType === "image/heic"
                      ? ".heic"
                      : ".jpg"),
              );
              new File(image).copy(file);
              imageURL = file.uri;
            }
          }
        } else {
          const buffer =
            Platform.OS === "web"
              ? await (await fetch(image)).arrayBuffer()
              : await new File(image).arrayBuffer();
          const fileName =
            session!.user.id +
            "/" +
            Date.now() +
            (mimeType === "image/png"
              ? ".png"
              : mimeType === "image/heic"
                ? ".heic"
                : ".jpg");
          const { error } = await supabase.storage
            .from("receipt-images")
            .upload(fileName, buffer, { contentType: mimeType });
          if (error)
            throw new Error(
              "Photo upload failed. Your receipt was not saved; please retry.",
            );
          imageURL = supabase.storage
            .from("receipt-images")
            .getPublicUrl(fileName).data.publicUrl;
        }
      }
      const data = {
        ...form,
        ...amounts,
        merchant_name: form.merchant_name.trim(),
        image_url: imageURL,
        ai_processed: processed,
      };
      if (id) await updateReceipt(id, data);
      else
        await createReceipt({
          ...data,
          profile_id: session?.user.id || DEMO_PROFILE,
        });
      setDirty(false);
      router.back();
    } catch (e) {
      savingRef.current = false;
      setError(
        e instanceof Error
          ? e.message
          : "Receipt could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (loadFailed)
    return (
      <Screen>
        <Notice text={error} />
        <MyButton
          title="Back to receipts"
          onPress={() => router.replace("/tabs/receiptList")}
        />
      </Screen>
    );
  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  return (
    <Screen>
      <Title
        eyebrow={id ? "Keep your records accurate" : "Capture / review / keep"}
        title={id ? "Edit your receipt" : "One less loose receipt."}
        subtitle="Save the details now. Keep a clearer picture for tax time."
      />
      {error && <Notice text={error} />}
      <Card>
        <Heading>Start with a photo</Heading>
        <Label muted>
          Attach a receipt, then enter or review its details below.
        </Label>
        {image && (
          <Image
            source={{ uri: image }}
            resizeMode="contain"
            style={{ height: 220, width: "100%", borderRadius: 14 }}
          />
        )}
        <MyButton
          title="Take a photo"
          onPress={() => pick(true)}
          disabled={busy || saving}
        />
        <MyButton
          title="Choose from photos"
          secondary
          onPress={() => pick(false)}
          disabled={busy || saving}
        />
        {image && (
          <>
            <MyButton
              title={busy ? "Reading receipt..." : "Read text on device"}
              secondary
              disabled={busy || saving}
              onPress={() => extract(false)}
            />
            {AI_ENABLED && (
              <MyButton
                title="Fill with AI"
                disabled={busy || saving}
                onPress={() => extract(true)}
              />
            )}
          </>
        )}
        <Label muted>
          {AI_ENABLED
            ? "Review AI results before saving."
            : "AI auto-fill is prepared and currently disconnected. Manual entry is ready."}
        </Label>
        {raw && (
          <Card accent>
            <Heading>Recognized text</Heading>
            <Text
              selectable
              style={{ color: theme.primaryText, lineHeight: 22 }}
            >
              {raw}
            </Text>
            <Label muted>
              Use the text above to fill in the receipt. Check all amounts
              against your photo.
            </Label>
          </Card>
        )}
      </Card>
      <Card>
        <Heading>Receipt details</Heading>
        {(
          [
            "merchant_name",
            "purchase_date",
            "subtotal",
            "sales_tax",
            "total",
            "payment_method",
          ] as const
        ).map((key) => (
          <TextField
            key={key}
            editable={!saving && !busy}
            placeholder={
              {
                merchant_name: "Merchant name",
                purchase_date: "Purchase date (YYYY-MM-DD)",
                subtotal: "Subtotal ($)",
                sales_tax: "Sales tax ($)",
                total: "Total paid ($)",
                payment_method: "Payment method",
              }[key]
            }
            value={form[key]}
            keyboardType={
              ["subtotal", "sales_tax", "total"].includes(key)
                ? "decimal-pad"
                : "default"
            }
            onChangeText={(v) => field(key, v)}
          />
        ))}
        <Label muted>Category</Label>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              onPress={() => field("category", c)}
              style={{
                padding: 12,
                borderRadius: 20,
                backgroundColor:
                  form.category === c ? theme.buttonPrimary : theme.card,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: form.category === c ? "white" : theme.primaryText,
                }}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <TextField
          placeholder="Notes (optional)"
          value={form.notes}
          onChangeText={(v) => field("notes", v)}
          multiline
          editable={!saving}
        />
      </Card>
      {error && <Notice text={error} />}
      <MyButton
        title={
          saving ? "Saving receipt..." : id ? "Save changes" : "Save receipt"
        }
        disabled={saving || busy}
        onPress={save}
      />
    </Screen>
  );
}
