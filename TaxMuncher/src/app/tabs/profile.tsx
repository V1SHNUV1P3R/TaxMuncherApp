import { Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  Title,
  Card,
  Label,
  Heading,
  IconButton,
  Notice,
  Loading,
  money,
  s,
} from "@/src/components/ui";
import { useTheme } from "@/src/components/ThemeProvider";
import { useReceipts } from "@/src/components/useReceipts";
import MyButton from "@/src/components/MyButton";
import ReceiptCard from "@/src/components/receiptCard";
import { summarizeReceipts } from "@/src/services/receiptSummary";
import { addSampleReceipts } from "@/src/services/receiptService";
export default function Overview() {
  const { theme } = useTheme();
  const { receipts, loading, error, isDemo, reload } = useReceipts();
  const { tax, spent } = summarizeReceipts(receipts);
  return (
    <Screen>
      <Title
        eyebrow="TaxMuncher / your receipt companion"
        title={"Small receipts.\nBigger picture."}
        subtitle="A little more organized. A lot more tax-ready."
        action={
          <IconButton
            name="settings-outline"
            label="Settings"
            onPress={() => router.push("/settings")}
          />
        }
      />
      {isDemo && (
        <Notice text="Local prototype: receipts stay on this device. Sign in from Settings to use your account." />
      )}
      <View
        style={{
          backgroundColor: "#A55226",
          borderRadius: 28,
          padding: 26,
          gap: 16,
        }}
      >
        <View style={s.between}>
          <Text
            style={{
              color: "#F5D6AE",
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: "700",
            }}
          >
            EVERY CENT ACCOUNTED FOR
          </Text>
          <Ionicons name="sparkles-outline" size={22} color="#ECB36F" />
        </View>
        <View>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 45,
              fontWeight: "800",
              letterSpacing: -2,
            }}
          >
            {money(tax)}
          </Text>
          <Text style={{ color: "#F5D6AE", fontSize: 14, marginTop: 5 }}>
            Sales tax tracked across your receipts
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#C77B4F" }} />
        <View style={s.between}>
          <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
            {receipts.length} receipts organized
          </Text>
          <Text style={{ color: "#ECB36F", fontSize: 12 }}>
            Ready for your review
          </Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Card>
            <Label muted>Total spending</Label>
            <Heading>{money(spent)}</Heading>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card>
            <Label muted>Receipts saved</Label>
            <Heading>{receipts.length.toString().padStart(2, "0")}</Heading>
          </Card>
        </View>
      </View>
      <MyButton
        title="Add a receipt"
        icon={<Ionicons name="add" size={20} color="white" />}
        onPress={() => router.push("/addReceipt")}
      />
      <Card accent>
        <View style={s.row}>
          <Ionicons name="scan-outline" color={theme.primary} size={28} />
          <View style={{ flex: 1 }}>
            <Heading>A smarter way to keep receipts</Heading>
          </View>
        </View>
        <Label muted>
          Capture a photo, review the details, and keep sales tax in one place.
          AI-assisted extraction is prepared for your next step.
        </Label>
        <MyButton
          title="Capture your next receipt"
          secondary
          onPress={() => router.push("/addReceipt")}
        />
      </Card>
      <View style={s.between}>
        <Heading>Recent receipts</Heading>
        <MyButton
          title="View all"
          secondary
          onPress={() => router.push("/tabs/receiptList")}
        />
      </View>
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Notice text={error} />
          <MyButton title="Try again" onPress={reload} />
        </>
      ) : receipts.length ? (
        receipts.slice(0, 3).map((r) => (
          <ReceiptCard
            key={r.id}
            receipt={r}
            onPress={() =>
              router.push({
                pathname: "/receiptDetails",
                params: { id: r.id },
              })
            }
          />
        ))
      ) : (
        <Card>
          <Heading>A fresh start</Heading>
          <Label muted>
            Your first receipt is the first step toward a clearer tax picture.
          </Label>
          {isDemo && (
            <MyButton
              title="Explore with sample receipts"
              secondary
              onPress={async () => {
                try {
                  await addSampleReceipts();
                  reload();
                } catch {
                  reload();
                }
              }}
            />
          )}
        </Card>
      )}
    </Screen>
  );
}
