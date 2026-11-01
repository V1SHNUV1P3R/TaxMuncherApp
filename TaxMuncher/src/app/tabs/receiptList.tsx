import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Title,
  Card,
  Heading,
  Label,
  Notice,
  Loading,
  IconButton,
  s,
} from "@/src/components/ui";
import { useTheme } from "@/src/components/ThemeProvider";
import { useReceipts } from "@/src/components/useReceipts";
import ReceiptCard from "@/src/components/receiptCard";
import TextField from "@/src/components/TextField";
import MyButton from "@/src/components/MyButton";
export default function ReceiptList() {
  const { theme } = useTheme();
  const { receipts, loading, error, reload } = useReceipts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [filters, setFilters] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const categories = ["All", ...new Set(receipts.map((r) => r.category))];
  const visible = useMemo(
    () =>
      receipts
        .filter(
          (r) =>
            (r.merchant_name + " " + r.notes + " " + r.category)
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            (category === "All" || r.category === category) &&
            (!min || r.total >= Number(min)) &&
            (!max || r.total <= Number(max)) &&
            (!start || r.purchase_date >= start) &&
            (!end || r.purchase_date <= end),
        )
        .sort((a, b) =>
          sort === "Highest"
            ? b.total - a.total
            : sort === "Lowest"
              ? a.total - b.total
              : sort === "A-Z"
                ? a.merchant_name.localeCompare(b.merchant_name)
                : sort === "Oldest"
                  ? a.purchase_date.localeCompare(b.purchase_date)
                  : b.purchase_date.localeCompare(a.purchase_date),
        ),
    [receipts, search, category, sort, min, max, start, end],
  );
  return (
    <Screen>
      <Title
        eyebrow="Your paper trail, simplified"
        title="Receipt library"
        subtitle={
          visible.length +
          " of " +
          receipts.length +
          " receipts in one happy place."
        }
        action={
          <IconButton
            name="add"
            label="Add receipt"
            onPress={() => router.push("/addReceipt")}
          />
        }
      />
      <TextField
        placeholder="Search merchants, categories, notes"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {categories.map((c) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: c === category }}
            key={c}
            onPress={() => setCategory(c)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 24,
              backgroundColor:
                c === category ? theme.buttonPrimary : theme.card,
            }}
          >
            <Text
              style={{
                color: c === category ? "white" : theme.secondaryText,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={s.between}>
        <Heading>All receipts</Heading>
        <MyButton
          title={filters ? "Hide filters" : "Filter & sort"}
          secondary
          onPress={() => setFilters(!filters)}
        />
      </View>
      {filters && (
        <Card>
          <Heading>Refine your library</Heading>
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {["Newest", "Oldest", "Highest", "Lowest", "A-Z"].map((v) => (
              <MyButton
                key={v}
                title={v}
                secondary={sort !== v}
                onPress={() => setSort(v)}
              />
            ))}
          </ScrollView>
          <TextField
            placeholder="Minimum amount"
            keyboardType="decimal-pad"
            value={min}
            onChangeText={setMin}
          />
          <TextField
            placeholder="Maximum amount"
            keyboardType="decimal-pad"
            value={max}
            onChangeText={setMax}
          />
          <TextField
            placeholder="From date (YYYY-MM-DD)"
            value={start}
            onChangeText={setStart}
          />
          <TextField
            placeholder="To date (YYYY-MM-DD)"
            value={end}
            onChangeText={setEnd}
          />
          <MyButton
            title="Reset filters"
            secondary
            onPress={() => {
              setSearch("");
              setCategory("All");
              setSort("Newest");
              setMin("");
              setMax("");
              setStart("");
              setEnd("");
            }}
          />
        </Card>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Notice text={error} />
          <MyButton title="Retry" onPress={reload} />
        </>
      ) : visible.length ? (
        visible.map((r) => (
          <ReceiptCard
            key={r.id}
            receipt={r}
            onPress={() =>
              router.push({ pathname: "/receiptDetails", params: { id: r.id } })
            }
          />
        ))
      ) : (
        <Card>
          <Heading>
            {receipts.length
              ? "No matches just yet"
              : "Make room for your first receipt"}
          </Heading>
          <Label muted>
            {receipts.length
              ? "Try another search or reset your filters."
              : "Capture or enter a receipt to start tracking sales tax."}
          </Label>
          <MyButton
            title="Add receipt"
            onPress={() => router.push("/addReceipt")}
          />
        </Card>
      )}
    </Screen>
  );
}
