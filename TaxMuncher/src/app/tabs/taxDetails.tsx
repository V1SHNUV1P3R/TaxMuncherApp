import { summarizeReceipts } from "@/src/services/receiptSummary";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, Share } from "react-native";
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
import { useReceipts } from "@/src/components/useReceipts";
import { useTheme } from "@/src/components/ThemeProvider";
import MyButton from "@/src/components/MyButton";
export default function TaxDetails() {
  const { theme } = useTheme();
  const { receipts, loading, error, reload, isDemo } = useReceipts();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const years = [
    ...new Set([
      String(new Date().getFullYear()),
      ...receipts.map((r) => r.purchase_date.slice(0, 4)),
    ]),
  ]
    .sort()
    .reverse();
  const {
    rows,
    tax: total,
    spent,
    categories: groups,
  } = summarizeReceipts(receipts, year);
  const [message, setMessage] = useState("");
  async function exportSummary() {
    try {
      const q = (v: string | number) =>
        '"' +
        (/^[=+@\-\t\r]/.test(String(v)) ? "'" : "") +
        String(v).replaceAll('"', '""') +
        '"';
      const csv = [
        "Merchant,Date,Category,Subtotal,Sales tax,Total",
        ...rows.map((r) =>
          [
            r.merchant_name,
            r.purchase_date,
            r.category,
            r.subtotal,
            r.sales_tax,
            r.total,
          ]
            .map(q)
            .join(","),
        ),
        "Total sales tax," + total.toFixed(2),
      ].join("\n");
      await Share.share({
        title: "TaxMuncher " + year + " sales tax summary",
        message: csv,
      });
    } catch {
      setMessage("Sharing is unavailable. Please try on your mobile device.");
    }
  }
  return (
    <Screen>
      <Title
        eyebrow="A clearer view of tax time"
        title="Your tax snapshot"
        subtitle="Every receipt adds to the picture. Here is where you stand."
      />
      <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
        {years.map((y) => (
          <Pressable
            key={y}
            accessibilityRole="button"
            accessibilityState={{ selected: y === year }}
            onPress={() => setYear(y)}
            style={{
              paddingVertical: 11,
              paddingHorizontal: 22,
              borderRadius: 22,
              backgroundColor: y === year ? theme.buttonPrimary : theme.card,
            }}
          >
            <Text
              style={{
                color: y === year ? "white" : theme.primaryText,
                fontWeight: "700",
              }}
            >
              {y}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Notice text={error} />
          <MyButton title="Retry" onPress={reload} />
        </>
      ) : (
        <>
          <View
            style={{
              backgroundColor: "#A55226",
              padding: 28,
              borderRadius: 28,
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                color: "#ECB36F",
              }}
            >
              TRACKED SALES TAX / {year}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 48,
                fontWeight: "800",
                letterSpacing: -2,
              }}
            >
              {money(total)}
            </Text>
            <Text style={{ color: "#F5D6AE", fontSize: 14, lineHeight: 22 }}>
              Recorded sales tax available for deduction eligibility review.
            </Text>
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Card>
                <Label muted>Receipt count</Label>
                <Heading>{rows.length}</Heading>
              </Card>
            </View>
            <View style={{ flex: 1 }}>
              <Card>
                <Label muted>Total purchases</Label>
                <Heading>{money(spent)}</Heading>
              </Card>
            </View>
          </View>
          <Card>
            <Heading>Sales tax by category</Heading>
            {groups.length ? (
              groups.map(([category, cents], i) => (
                <View key={category} style={{ gap: 9 }}>
                  <View style={s.between}>
                    <Label>{category}</Label>
                    <Heading>{money(cents / 100)}</Heading>
                  </View>
                  <View
                    style={{
                      height: 7,
                      borderRadius: 5,
                      backgroundColor: theme.card,
                    }}
                  >
                    <View
                      style={{
                        height: 7,
                        borderRadius: 5,
                        width: ((total ? (cents / (total * 100)) * 100 : 0) +
                          "%") as `${number}%`,
                        backgroundColor: [
                          "#A55226",
                          "#D07335",
                          "#DB8A45",
                          "#ECB36F",
                        ][i % 4],
                      }}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Label muted>
                Add receipts for this year to see your category breakdown.
              </Label>
            )}
          </Card>
          <Notice text="This is recorded sales tax, not a guaranteed deduction or refund. Deductibility depends on your location, filing choices, and eligibility. Review your receipts with a tax professional." />
          {isDemo && (
            <Label muted>
              Local prototype records only. Sample receipts, if added, are
              included in these totals.
            </Label>
          )}
          <MyButton
            title="Share receipt summary (CSV)"
            disabled={!rows.length}
            onPress={exportSummary}
          />
          {message && <Notice text={message} />}
        </>
      )}
    </Screen>
  );
}
