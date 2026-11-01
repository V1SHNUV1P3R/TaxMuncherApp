import { localDate } from "./receiptValidation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import { Receipt } from "@/src/data/receiptData";
const KEY = "taxmuncher.receipts.v1";
export const DEMO_PROFILE = "local-prototype";
let queue: Promise<unknown> = Promise.resolve();
async function local(): Promise<Receipt[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
function mutate(fn: (rows: Receipt[]) => Receipt[]) {
  const next = queue.then(async () => {
    const rows = fn(await local());
    await AsyncStorage.setItem(KEY, JSON.stringify(rows));
  });
  queue = next.catch(() => {});
  return next;
}
export async function getReceipts(
  profileId = DEMO_PROFILE,
): Promise<Receipt[]> {
  if (profileId === DEMO_PROFILE)
    return (await local()).sort((a, b) =>
      b.purchase_date.localeCompare(a.purchase_date),
    );
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("profile_id", profileId)
    .order("purchase_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}
function normalize(r: Receipt): Receipt {
  return {
    ...r,
    subtotal: Number(r.subtotal),
    sales_tax: Number(r.sales_tax),
    total: Number(r.total),
  };
}
export async function getReceipt(id: string): Promise<Receipt | null> {
  if (id.startsWith("local-"))
    return (await local()).find((r) => r.id === id) ?? null;
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}
export async function createReceipt(
  receipt: Omit<Receipt, "id">,
): Promise<void> {
  if (receipt.profile_id === DEMO_PROFILE) {
    await mutate((rows) => [
      ...rows,
      {
        ...receipt,
        id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
      },
    ]);
    return;
  }
  const { error } = await supabase.from("receipts").insert(receipt);
  if (error) throw error;
}
export async function updateReceipt(id: string, updates: Partial<Receipt>) {
  if (id.startsWith("local-")) {
    await mutate((rows) =>
      rows.map((r) =>
        r.id === id
          ? { ...r, ...updates, id: r.id, profile_id: r.profile_id }
          : r,
      ),
    );
    return;
  }
  const { error } = await supabase
    .from("receipts")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}
export async function deleteReceipt(id: string) {
  if (id.startsWith("local-")) {
    await mutate((rows) => rows.filter((r) => r.id !== id));
    return;
  }
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) throw error;
}
export async function getSalesTaxTotal(profileId = DEMO_PROFILE) {
  return (
    (await getReceipts(profileId)).reduce(
      (sum, r) => sum + Math.round(r.sales_tax * 100),
      0,
    ) / 100
  );
}
export async function addSampleReceipts() {
  const today = localDate();
  for (const [merchant, category, subtotal, tax] of [
    ["Whole Foods Market", "Grocery", 82.4, 4.94],
    ["Blue Bottle Coffee", "Food", 14.5, 1.16],
    ["The Home Depot", "Home", 129.0, 10.32],
  ] as const) {
    await createReceipt({
      profile_id: DEMO_PROFILE,
      merchant_name: merchant,
      category,
      purchase_date: today,
      subtotal,
      sales_tax: tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      payment_method: "Visa",
      notes: "Sample receipt for exploring the prototype.",
      ai_processed: false,
    });
  }
}
