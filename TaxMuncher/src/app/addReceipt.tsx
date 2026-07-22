import { useAuth } from "@/src/components/AuthProvider";
import MyButton from "@/src/components/MyButton";
import TextField from "@/src/components/TextField";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";
import { useBackHandler } from "@/src/components/useBackHandler";
import { supabase } from "@/utils/supabase";
import { analyzeReceipt } from "@/src/services/receiptAIService";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useNavigation } from "expo-router";
import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const theme = colors.dark;

export default function AddReceipt() {
  const router = useRouter();
  const navigation = useNavigation();
  const { session } = useAuth();

  const [merchant, setMerchant] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [salesTax, setSalesTax] = useState("");
  const [total, setTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("Other");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProcessed, setAiProcessed] = useState(false);

  const isSaving = useRef(false);

  const isDirty =
    merchant.trim() !== "" ||
    subtotal.trim() !== "" ||
    salesTax.trim() !== "" ||
    total.trim() !== "" ||
    paymentMethod.trim() !== "" ||
    notes.trim() !== "" ||
    image !== null;

  useBackHandler(isDirty, isSaving);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const uri = result.assets[0].uri;
    setImage(uri);

    setIsAnalyzing(true);
    try {
      const receipt = await analyzeReceipt(uri);

      setMerchant(receipt.merchant_name);
      setSubtotal(receipt.subtotal.toString());
      setSalesTax(receipt.sales_tax.toString());
      setTotal(receipt.total.toString());
      setPaymentMethod(receipt.payment_method);
      setNotes(receipt.notes);
      setCategory(receipt.category || "Other");
      setAiProcessed(true);

      if (receipt.confidence < 60) {
        Alert.alert(
          "Please double-check this receipt",
          "The scan quality was low, so some fields may be inaccurate. Review the details before saving."
        );
      }
    } catch (err) {
      console.error("Receipt analysis failed:", err);
      Alert.alert(
        "Couldn't read receipt",
        "We couldn't extract details automatically. You can still fill the form in manually."
      );
      setAiProcessed(false);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function uploadImage() {
    if (!image) return null;

    const response = await fetch(image);
    const blob = await response.blob();
    const fileName = `${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("receipt-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });

    if (error) {
      Alert.alert(error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("receipt-images").getPublicUrl(fileName);

    return publicUrl;
  }

  async function saveReceipt() {
    if (!session?.user) {
      Alert.alert("Please sign in before saving a receipt.");
      return;
    }

    if (!merchant.trim()) {
      Alert.alert("Merchant name required.");
      return;
    }

    isSaving.current = true;
    const imageURL = await uploadImage();

    const { error } = await supabase.from("receipts").insert({
      profile_id: session?.user.id,
      merchant_name: merchant,
      category: category,
      subtotal: Number(subtotal),
      sales_tax: Number(salesTax),
      total: Number(total),
      payment_method: paymentMethod,
      notes,
      image_url: imageURL,
      ai_processed: aiProcessed,
    });

    if (error) {
      Alert.alert(error.message);
      isSaving.current = false;
      return;
    }

    Alert.alert("Receipt Saved!");
    router.back();
  }

  return (
    <ScrollView
      style={defaultStyles.screen}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <Text style={defaultStyles.heroTitle}>Add Receipt</Text>

      <Text style={defaultStyles.subheading}>
        Save receipts for taxes and expenses.
      </Text>

      <TouchableOpacity
        style={[
          defaultStyles.card,
          {
            marginTop: 30,
            alignItems: "center",
          },
        ]}
        onPress={pickImage}
        disabled={isAnalyzing}
      >
        {image ? (
          <Image
            source={{
              uri: image,
            }}
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
            }}
          />
        ) : (
          <>
            <Text
              style={{
                fontSize: 50,
              }}
            >
              📷
            </Text>

            <Text style={defaultStyles.caption}>Tap to add receipt photo</Text>
          </>
        )}

        {isAnalyzing && (
          <View style={{ marginTop: 12, alignItems: "center" }}>
            <ActivityIndicator color={theme.primary} />
            <Text style={defaultStyles.caption}>Reading receipt…</Text>
          </View>
        )}
      </TouchableOpacity>

      <View
        style={{
          marginTop: 24,
          gap: 18,
        }}
      >
        <TextField
          placeholder="Merchant"
          value={merchant}
          onChangeText={setMerchant}
        />

        <TextField
          placeholder="Subtotal"
          value={subtotal}
          onChangeText={setSubtotal}
        />

        <TextField
          placeholder="Sales Tax"
          value={salesTax}
          onChangeText={setSalesTax}
        />

        <TextField placeholder="Total" value={total} onChangeText={setTotal} />

        <TextField
          placeholder="Payment Method"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
        />

        <TextField placeholder="Category" value={category} onChangeText={setCategory} />

        <TextField placeholder="Notes" value={notes} onChangeText={setNotes} />
      </View>

      <View
        style={{
          marginTop: 32,
        }}
      >
        <MyButton
          title="Save Receipt"
          onPress={saveReceipt}
          color={theme.primary}
        />
      </View>
    </ScrollView>
  );
}