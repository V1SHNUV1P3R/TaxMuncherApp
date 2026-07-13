import { useAuth } from "@/src/components/AuthProvider";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";
import { supabase } from "@/utils/supabase";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Receipt } from "@/src/data/receiptData";

import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import MyButton from "@/src/components/MyButton";

const theme = colors.dark;

type TaxCategory = {
  category_name: string;
  deductible: boolean;
};

export default function TaxDetails() {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);

  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const [categories, setCategories] = useState<TaxCategory[]>([]);

  const [showIRS, setShowIRS] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSalesTax, setShowSalesTax] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [taxRate, setTaxRate] = useState(22);
  const [showSavings, setShowSavings] = useState(false);

  async function loadData() {
    if (!session?.user) return;

    setLoading(true);

    const receiptResult = await supabase
      .from("receipts")
      .select("*")
      .eq("profile_id", session.user.id);

    const categoryResult = await supabase
      .from("tax_categories")
      .select("category_name,deductible");

    if (!receiptResult.error && receiptResult.data) {
      setReceipts(receiptResult.data);
    }

    if (!categoryResult.error && categoryResult.data) {
      setCategories(categoryResult.data);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const deductibleCategories = useMemo(() => {
    return new Set(
      categories.filter((c) => c.deductible).map((c) => c.category_name),
    );
  }, [categories]);

  const totalSpent = useMemo(
    () => receipts.reduce((sum, receipt) => sum + Number(receipt.total), 0),
    [receipts],
  );

  const deductibleTotal = useMemo(() => {
    return receipts.reduce((sum, receipt) => {
      if (deductibleCategories.has(receipt.category)) {
        return sum + Number(receipt.total);
      }

      return sum;
    }, 0);
  }, [receipts, deductibleCategories]);

  const totalSalesTax = useMemo(() => {
    return receipts.reduce(
      (sum, receipt) => sum + Number(receipt.sales_tax),
      0,
    );
  }, [receipts]);

  const groupedTotals = useMemo(() => {
    const map: Record<string, number> = {};

    receipts.forEach((receipt) => {
      map[receipt.category] =
        (map[receipt.category] ?? 0) + Number(receipt.total);
    });

    return map;
  }, [receipts]);

  const estimatedSavings = useMemo(() => {
    return deductibleTotal * (taxRate / 100);
  }, [deductibleTotal, taxRate]);

  if (loading) {
    return (
      <View style={[defaultStyles.screen, defaultStyles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
      <Text style={defaultStyles.heroTitle}>Tax Dashboard</Text>

      <Text style={defaultStyles.subheading}>
        View estimated tax information from your receipts.
      </Text>

      {/* SUMMARY */}
      <View style={[defaultStyles.card, { marginTop: 24 }]}>
        <Text style={defaultStyles.caption}>Receipts</Text>
        <Text style={defaultStyles.heroTitle}>{receipts.length}</Text>

        <View style={{ height: 20 }} />

        <Text style={defaultStyles.caption}>Total Spent</Text>
        <Text style={defaultStyles.heroTitle}>${totalSpent.toFixed(2)}</Text>

        <View style={{ height: 20 }} />

        <Text style={defaultStyles.caption}>Estimated Deductible</Text>

        <Text
          style={[
            defaultStyles.heroTitle,
            {
              color: theme.success,
            },
          ]}
        >
          ${deductibleTotal.toFixed(2)}
        </Text>
      </View>

      <View style={{ height: 24 }} />

      <MyButton
        title={
          showBreakdown ? "Hide Deduction Breakdown" : "Deduction Breakdown"
        }
        onPress={() => setShowBreakdown(!showBreakdown)}
      />

      {showBreakdown && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>
            Estimated Deductible Expenses
          </Text>

          <Text
            style={[
              defaultStyles.heroTitle,
              {
                color: theme.success,
                marginTop: 10,
              },
            ]}
          >
            ${deductibleTotal.toFixed(2)}
          </Text>

          <Text
            style={[
              defaultStyles.caption,
              {
                marginTop: 10,
              },
            ]}
          >
            This is based on receipt categories you've marked as deductible.
          </Text>
        </View>
      )}

      <View style={{ height: 18 }} />

      <MyButton
        title={
          showCategories ? "Hide Category Breakdown" : "Show Category Breakdown"
        }
        color={theme.primary}
        onPress={() => setShowCategories(!showCategories)}
      />

      {showCategories && (
        <View style={{ marginTop: 20 }}>
          <Text
            style={[
              defaultStyles.heading,
              {
                marginBottom: 12,
              },
            ]}
          >
            Spending by Category
          </Text>

          {Object.entries(groupedTotals).map(([category, total]) => {
            const deductible = deductibleCategories.has(category);

            return (
              <View key={category} style={defaultStyles.card}>
                <View style={defaultStyles.rowBetween}>
                  <View>
                    <Text style={defaultStyles.body}>{category}</Text>

                    <Text style={defaultStyles.caption}>
                      {deductible
                        ? "Potentially Deductible"
                        : "Not Marked Deductible"}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: 20,
                      color: deductible ? theme.success : theme.primaryText,
                    }}
                  >
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ marginTop: 20 }}>
        <MyButton
          title={showIRS ? "Hide IRS Eligibility" : "IRS Deduction Eligibility"}
          onPress={() => setShowIRS(!showIRS)}
          color={theme.secondary}
          textColor={theme.primaryText}
        />
      </View>

      {showIRS && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>Deductible Categories</Text>

          {categories.map((category) => (
            <View
              key={category.category_name}
              style={[defaultStyles.rowBetween, { marginTop: 14 }]}
            >
              <Text style={defaultStyles.body}>{category.category_name}</Text>

              <Text
                style={{
                  color: category.deductible ? theme.success : theme.danger,
                  fontWeight: "700",
                }}
              >
                {category.deductible ? "Eligible" : "No"}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <MyButton
          title={showTips ? "Hide Filing Tips" : "Tax Filing Tips"}
          onPress={() => setShowTips(!showTips)}
          color={theme.primary}
        />
      </View>

      {showTips && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>Tips</Text>

          <Text style={[defaultStyles.body, { marginTop: 12 }]}>
            • Keep every receipt related to deductible expenses.
          </Text>

          <Text style={[defaultStyles.body, { marginTop: 10 }]}>
            • Business expenses generally require documentation.
          </Text>

          <Text style={[defaultStyles.body, { marginTop: 10 }]}>
            • Sales tax deductions are subject to IRS rules and limitations.
          </Text>

          <Text style={[defaultStyles.body, { marginTop: 10 }]}>
            • Consult a CPA before filing your taxes.
          </Text>
        </View>
      )}

      <View style={{ height: 18 }} />

      <MyButton
        title={showSalesTax ? "Hide Sales Tax" : "Sales Tax Paid"}
        onPress={() => setShowSalesTax(!showSalesTax)}
      />

      <MyButton
        title={showSavings ? "Hide Estimated Savings" : "Estimated Tax Savings"}
        onPress={() => setShowSavings(!showSavings)}
      />

      {showSalesTax && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>Sales Tax Paid</Text>

          <Text
            style={[
              defaultStyles.heroTitle,
              {
                color: theme.warning,
                marginTop: 10,
              },
            ]}
          >
            ${totalSalesTax.toFixed(2)}
          </Text>
        </View>
      )}

      {showSavings && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>Estimated Tax Savings</Text>

          <Text
            style={[
              defaultStyles.heroTitle,
              {
                color: theme.success,
                marginTop: 12,
              },
            ]}
          >
            ${estimatedSavings.toFixed(2)}
          </Text>

          <Text
            style={[
              defaultStyles.caption,
              {
                marginTop: 8,
              },
            ]}
          >
            Based on a {taxRate}% estimated marginal tax rate.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Text style={defaultStyles.caption}>Choose Tax Rate</Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 10,
                gap: 10,
              }}
            >
              {[10, 12, 22, 24, 32, 35, 37].map((rate) => (
                <View key={rate} style={{ width: "30%" }}>
                  <MyButton
                    title={`${rate}%`}
                    color={
                      taxRate === rate
                        ? theme.buttonPrimary
                        : theme.buttonSecondary
                    }
                    textColor={
                      taxRate === rate ? theme.buttonText : theme.primaryText
                    }
                    onPress={() => setTaxRate(rate)}
                  />
                </View>
              ))}
            </View>
          </View>

          <Text
            style={[
              defaultStyles.small,
              {
                marginTop: 18,
              },
            ]}
          >
            This estimate assumes deductible expenses reduce taxable income.
            Actual tax savings depend on your filing status, jurisdiction,
            eligibility, and applicable tax laws.
          </Text>
        </View>
      )}

      <View style={{ height: 18 }} />

      <MyButton
        title={showDisclaimer ? "Hide Disclaimer" : "Tax Disclaimer"}
        onPress={() => setShowDisclaimer(!showDisclaimer)}
        color={theme.buttonSecondary}
        textColor={theme.primaryText}
      />

      {showDisclaimer && (
        <View style={defaultStyles.card}>
          <Text style={defaultStyles.heading}>Disclaimer</Text>

          <Text
            style={[
              defaultStyles.caption,
              {
                marginTop: 12,
              },
            ]}
          >
            These calculations are estimates based on the receipts you've
            entered. Actual deductions depend on applicable tax laws and your
            personal filing situation. Consult a qualified tax professional
            before filing taxes.
          </Text>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <MyButton
          title="Export Tax Report"
          color={theme.warning}
          textColor={theme.buttonText}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "PDF tax reports will be available in a future update.",
            );
          }}
        />
      </View>
    </ScrollView>
  );
}
