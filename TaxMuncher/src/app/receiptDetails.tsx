import { useAuth } from "@/components/AuthProvider";
import MyButton from "@/components/MyButton";
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";

import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    View,
} from "react-native";

const theme = colors.dark;

type Receipt = {
  id: string;
  merchant_name: string;
  purchase_date: string;
  subtotal: number;
  sales_tax: number;
  total: number;
  payment_method: string;
  image_url: string;
  category: string;
  notes?: string;
  ai_processed?: boolean;
};

const categoryIcons: Record<string, string> = {
  Grocery: "🛒",
  Food: "🍔",
  Gas: "⛽",
  Electronics: "💻",
  Clothing: "👕",
  Medical: "🏥",
  Transportation: "🚗",
  Entertainment: "🎮",
  Education: "📚",
  Home: "🏠",
  Shopping: "📦",
  Other: "🧾",
};

export default function ReceiptDetails() {
  const router = useRouter();
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  async function fetchReceipt() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setReceipt(data);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      fetchReceipt();
    }, [id]),
  );

  function deleteReceipt() {
    Alert.alert("Delete Receipt", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("receipts")
            .delete()
            .eq("id", id);

          if (error) {
            Alert.alert(error.message);
            return;
          }

          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[defaultStyles.screen, defaultStyles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={[defaultStyles.screen, defaultStyles.center]}>
        <Text style={defaultStyles.heading}>Receipt not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={defaultStyles.screen}
      contentContainerStyle={{
        paddingBottom: 60,
      }}
    >
      {/* Header */}
      <View style={defaultStyles.center}>
        <Text style={defaultStyles.subheading}>Receipt</Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: theme.primaryText,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {receipt.merchant_name}
        </Text>

        <Text
          style={{
            fontSize: 36,
            fontWeight: "800",
            color: theme.primary,
            marginTop: 6,
          }}
        >
          ${Number(receipt.total).toFixed(2)}
        </Text>
      </View>

      {/* Image */}
      {receipt.image_url && (
        <View
          style={[
            defaultStyles.card,
            {
              marginTop: 24,
              alignItems: "center",
            },
          ]}
        >
          <Image
            source={{ uri: receipt.image_url }}
            style={{
              width: "100%",
              height: 260,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Info Section */}
      <View
        style={{
          marginTop: 24,
          gap: 16,
        }}
      >
        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Merchant</Text>
          <Text style={defaultStyles.body}>{receipt.merchant_name}</Text>
        </View>

        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Category</Text>
          <Text style={defaultStyles.body}>
            {categoryIcons[receipt.category] ?? "🧾"} {receipt.category}
          </Text>
        </View>

        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Purchase Date</Text>
          <Text style={defaultStyles.body}>{receipt.purchase_date}</Text>
        </View>

        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Payment</Text>
          <Text style={defaultStyles.body}>{receipt.payment_method}</Text>
        </View>

        {receipt.notes ? (
          <View style={defaultStyles.rowBetween}>
            <Text style={defaultStyles.caption}>Notes</Text>
            <Text style={defaultStyles.body}>{receipt.notes}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={{
          marginVertical: 20,
          height: 1,
          backgroundColor: theme.border,
        }}
      />

      {/* Totals Section */}
      <View style={{ gap: 10 }}>
        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Subtotal</Text>
          <Text style={defaultStyles.body}>
            ${Number(receipt.subtotal).toFixed(2)}
          </Text>
        </View>

        <View style={defaultStyles.rowBetween}>
          <Text style={defaultStyles.caption}>Sales Tax</Text>
          <Text style={defaultStyles.body}>
            ${Number(receipt.sales_tax).toFixed(2)}
          </Text>
        </View>

        <View style={defaultStyles.rowBetween}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 17,
              color: theme.primaryText,
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontWeight: "800",
              fontSize: 18,
              color: theme.primary,
            }}
          >
            ${Number(receipt.total).toFixed(2)}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginVertical: 20,
          height: 1,
          backgroundColor: theme.border,
        }}
      />

      {/* AI Status */}
      <View style={defaultStyles.rowBetween}>
        <Text style={defaultStyles.caption}>AI Status</Text>
        <Text style={defaultStyles.body}>
          {receipt.ai_processed ? "✔ Verified" : "Not Processed"}
        </Text>
      </View>

      {/* Buttons */}
      <View
        style={{
          marginTop: 32,
          gap: 14,
        }}
      >
        <MyButton
          title="Edit Receipt"
          onPress={() =>
            router.push({
              pathname: "/editReceipt",
              params: { id },
            } as any)
          }
          color={theme.primary}
        />

        <MyButton
          title="Delete Receipt"
          onPress={deleteReceipt}
          color={theme.danger}
        />
      </View>
    </ScrollView>
  );
}
