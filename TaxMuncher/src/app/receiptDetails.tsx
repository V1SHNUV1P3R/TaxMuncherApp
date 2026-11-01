import { useCallback, useState } from "react";
import { Image, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Screen,
  Title,
  Card,
  Heading,
  Label,
  Notice,
  Loading,
  money,
  s,
} from "@/src/components/ui";
import MyButton from "@/src/components/MyButton";
import { Receipt } from "@/src/data/receiptData";
import { deleteReceipt, getReceipt } from "@/src/services/receiptService";
export default function ReceiptDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getReceipt(id)
        .then((r) => {
          if (active) {
            setReceipt(r);
            setError(r ? "" : "This receipt could not be found.");
          }
        })
        .catch(() => {
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
    }, [id]),
  );
  async function remove() {
    setBusy(true);
    try {
      await deleteReceipt(id);
      router.replace("/tabs/receiptList");
    } catch {
      setError("Receipt could not be deleted. Please try again.");
      setBusy(false);
    }
  }
  return (
    <Screen>
      {loading ? (
        <Loading />
      ) : receipt ? (
        <>
          <Title
            eyebrow={
              receipt.ai_processed
                ? "AI-assisted / review saved"
                : "Your saved receipt"
            }
            title={receipt.merchant_name}
            subtitle={receipt.purchase_date + " / " + receipt.category}
          />
          {receipt.image_url && (
            <Image
              source={{ uri: receipt.image_url }}
              resizeMode="contain"
              style={{ height: 280, width: "100%", borderRadius: 20 }}
            />
          )}
          <Card accent>
            <Label muted>Sales tax recorded</Label>
            <Heading>{money(receipt.sales_tax)}</Heading>
            <Label muted>This amount is included in your tax summary.</Label>
          </Card>
          <Card>
            <Heading>Purchase breakdown</Heading>
            {[
              ["Subtotal", money(receipt.subtotal)],
              ["Sales tax", money(receipt.sales_tax)],
              ["Total paid", money(receipt.total)],
              ["Payment", receipt.payment_method || "Not specified"],
              ["Category", receipt.category],
            ].map(([label, value]) => (
              <View key={label} style={s.between}>
                <Label muted>{label}</Label>
                <Heading>{value}</Heading>
              </View>
            ))}
            {receipt.notes && (
              <>
                <Heading>Notes</Heading>
                <Label>{receipt.notes}</Label>
              </>
            )}
          </Card>
          <MyButton
            title="Edit receipt"
            onPress={() =>
              router.push({ pathname: "/editReceipt", params: { id } })
            }
          />
          {confirm ? (
            <Card>
              <Heading>Delete this receipt?</Heading>
              <Label muted>
                Its sales tax will also be removed from your summary.
              </Label>
              <MyButton
                title={busy ? "Deleting..." : "Confirm delete"}
                color="#B53732"
                disabled={busy}
                onPress={remove}
              />
              <MyButton
                title="Keep receipt"
                secondary
                disabled={busy}
                onPress={() => setConfirm(false)}
              />
            </Card>
          ) : (
            <MyButton
              title="Delete receipt"
              secondary
              onPress={() => setConfirm(true)}
            />
          )}
        </>
      ) : null}
      {error && <Notice text={error} />}
    </Screen>
  );
}
