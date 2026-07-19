import { useAuth } from "@/src/components/AuthProvider";
import MyButton from "@/src/components/MyButton";
import { getReceipts, getSalesTaxTotal } from "@/src/services/receiptService";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";

import { useEffect, useState } from "react";

import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const theme = colors.dark;

export default function TaxDetails() {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);

  const [salesTaxTotal, setSalesTaxTotal] = useState(0);

  const [receiptCount, setReceiptCount] = useState(0);

  const [showExplanation, setShowExplanation] = useState(false);

  const loadData = async () => {
    if (!session?.user) {
      setReceiptCount(0);
      setSalesTaxTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [receipts, taxTotal] = await Promise.all([
        getReceipts(session.user.id),
        getSalesTaxTotal(session.user.id),
      ]);

      setReceiptCount(receipts.length);
      setSalesTaxTotal(taxTotal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={[defaultStyles.screen, defaultStyles.center]}>
        <ActivityIndicator size="large" color={theme.buttonPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={defaultStyles.screen}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <Text style={defaultStyles.heroTitle}>Sales Tax Summary</Text>

      <Text style={defaultStyles.subheading}>
        Total sales tax from your saved receipts.
      </Text>

      <View style={defaultStyles.card}>
        <Text style={defaultStyles.caption}>Receipts Processed</Text>

        <Text style={defaultStyles.heroTitle}>{receiptCount}</Text>
      </View>

      <View style={defaultStyles.card}>
        <Text style={defaultStyles.caption}>Total Sales Tax Paid</Text>

        <Text
          style={[
            defaultStyles.heroTitle,
            {
              color: theme.success,
            },
          ]}
        >
          ${salesTaxTotal.toFixed(2)}
        </Text>
      </View>

      <MyButton
        title={showExplanation ? "Hide Information" : "How can I use this?"}
        color={theme.buttonPrimary}
        onPress={() => setShowExplanation(!showExplanation)}
      />

      {showExplanation && (
        <View
          style={[
            defaultStyles.card,
            {
              marginTop: 20,
            },
          ]}
        >
          <Text style={defaultStyles.heading}>What is this?</Text>

          <Text
            style={[
              defaultStyles.body,
              {
                marginTop: 10,
              },
            ]}
          >
            This is the total amount of sales tax you've paid across every
            receipt stored in your account.
          </Text>

          <Text
            style={[
              defaultStyles.body,
              {
                marginTop: 12,
              },
            ]}
          >
            Depending on your country, state, and your individual tax situation,
            some taxpayers may be able to claim sales tax as part of their tax
            filing.
          </Text>

          <Text
            style={[
              defaultStyles.caption,
              {
                marginTop: 18,
              },
            ]}
          >
            This app simply totals the sales tax recorded on your receipts.
            Whether that amount can be claimed depends on the tax rules that
            apply to you. Consider consulting a qualified tax professional
            before filing.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
