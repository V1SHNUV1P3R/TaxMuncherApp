import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Receipt } from "@/src/data/receiptData";
import { useTheme } from "./ThemeProvider";
import { money, s } from "./ui";
export default function ReceiptCard({
  receipt,
  onPress,
}: {
  receipt: Receipt;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={receipt.merchant_name + ", " + money(receipt.total)}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 17,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surface,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View style={s.row}>
        <View
          style={{
            width: 44,
            height: 48,
            borderRadius: 14,
            backgroundColor: theme.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="receipt-outline" size={23} color={theme.primary} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text
            style={{
              color: theme.primaryText,
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            {receipt.merchant_name}
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: 11 }}>
            {receipt.category} / {receipt.purchase_date}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 5 }}>
          <Text
            style={{
              color: theme.primaryText,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            {money(receipt.total)}
          </Text>
          <Text style={{ color: theme.primary, fontSize: 11 }}>
            Tax {money(receipt.sales_tax)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
