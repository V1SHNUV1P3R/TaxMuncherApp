import { useAuth } from "@/src/components/AuthProvider";
import MyButton from "@/src/components/MyButton";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
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

export default function ReceiptList() {
  const router = useRouter();

  const { session } = useAuth();

  const [loading, setLoading] = useState(true);

  const [receipts, setReceipts] = useState<Receipt[]>([]);

  async function fetchReceipts() {
    if (!session?.user) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("profile_id", session.user.id)
      .order("purchase_date", {
        ascending: false,
      });

    if (!error && data) {
      setReceipts(data);
    } else {
      setReceipts([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchReceipts();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={[defaultStyles.screen, defaultStyles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={defaultStyles.screen}>
      <View style={defaultStyles.rowBetween}>
        <View>
          <Text style={defaultStyles.heroTitle}>Receipts</Text>

          <Text style={defaultStyles.subheading}>{receipts.length} Stored</Text>
        </View>

        <View
          style={{
            width: 150,
          }}
        >
          <MyButton
            title="+ Add"
            onPress={() => router.push("../addReceipt")}
            color={theme.primary}
          />
        </View>
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 120,
        }}
        ListEmptyComponent={() => (
          <View
            style={[
              defaultStyles.center,
              {
                marginTop: 80,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 70,
              }}
            >
              🧾
            </Text>

            <Text style={defaultStyles.heading}>No Receipts Yet</Text>

            <Text
              style={[
                defaultStyles.caption,
                {
                  marginTop: 8,
                  textAlign: "center",
                },
              ]}
            >
              Add your first receipt to begin tracking purchases.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            // onPress={() =>
            //     router.push({
            //         pathname: "/receiptDetails",
            //         params: {
            //             id: item.id,
            //         },
            //     })
            // }
            style={{
              backgroundColor: theme.surface,
              borderRadius: 22,
              padding: 18,
              marginBottom: 18,

              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={defaultStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: theme.primaryText,
                  }}
                >
                  {item.merchant_name}
                </Text>

                <Text
                  style={{
                    color: theme.secondaryText,
                    marginTop: 3,
                  }}
                >
                  {item.payment_method}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: theme.primary,
                }}
              >
                ${Number(item.total).toFixed(2)}
              </Text>
            </View>

            <View
              style={{
                marginVertical: 16,
                height: 1,
                backgroundColor: theme.border,
              }}
            />

            <View style={defaultStyles.rowBetween}>
              <View>
                <Text style={defaultStyles.caption}>Purchase Date</Text>

                <Text style={defaultStyles.body}>{item.purchase_date}</Text>
              </View>

              <View
                style={{
                  backgroundColor: theme.secondary,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  {item.payment_method}
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 18,
              }}
            >
              <View style={defaultStyles.rowBetween}>
                <Text style={defaultStyles.caption}>Subtotal</Text>

                <Text style={defaultStyles.body}>
                  ${Number(item.subtotal).toFixed(2)}
                </Text>
              </View>

              <View style={[defaultStyles.rowBetween, { marginTop: 8 }]}>
                <Text style={defaultStyles.caption}>Sales Tax</Text>

                <Text style={defaultStyles.body}>
                  ${Number(item.sales_tax).toFixed(2)}
                </Text>
              </View>

              <View style={[defaultStyles.rowBetween, { marginTop: 8 }]}>
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
                  ${Number(item.total).toFixed(2)}
                </Text>
              </View>
            </View>

            {item.image_url && (
              <View
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 14,
                  }}
                  resizeMode="cover"
                />

                <Text
                  style={{
                    fontSize: 24,
                    color: theme.primary,
                  }}
                >
                  ›
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
