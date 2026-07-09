import { useAuth } from "@/components/AuthProvider";
import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";

import * as ImagePicker from "expo-image-picker";

import { decode } from "base64-arraybuffer";

import { useRouter } from "expo-router";
import { useState } from "react";

import {
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
  const { session } = useAuth();

  const [merchant, setMerchant] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [salesTax, setSalesTax] = useState("");
  const [total, setTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const [image, setImage] = useState<string | null>(null);

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

    if (!result.canceled) {
      setImage(result.assets[0].uri);

      /*
      Future AI OCR

      await sendReceiptToAI(result.assets[0].uri)

      Auto fills:

      Merchant
      Total
      Tax
      Date
      Time

      */
    }
  }

  async function uploadImage() {
    if (!image) return null;

    const response = await fetch(image);

    const blob = await response.blob();

    const reader = new FileReader();

    const base64Promise: Promise<string> = new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });

    reader.readAsDataURL(blob);

    const data = await base64Promise;

    const base64 = data.split(",")[1];

    const fileName = `${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("receipt-images")
      .upload(fileName, decode(base64), {
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
    if (!merchant.trim()) {
      Alert.alert("Merchant name required.");
      return;
    }

    const imageURL = await uploadImage();

    const { error } = await supabase.from("receipts").insert({
      profile_id: session?.user.id,

      merchant_name: merchant,

      category: "Other",

      subtotal: Number(subtotal),

      sales_tax: Number(salesTax),

      total: Number(total),

      payment_method: paymentMethod,

      notes,

      image_url: imageURL,

      ai_processed: false,
    });

    if (error) {
      Alert.alert(error.message);
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
