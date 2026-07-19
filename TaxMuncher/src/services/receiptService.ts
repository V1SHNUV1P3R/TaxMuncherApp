import { supabase } from "@/utils/supabase";
import { Receipt } from "@/src/data/receiptData";

export async function getReceipts(
  profileId: string
): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("profile_id", profileId)
    .order("purchase_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Receipt[];
}

export async function getSalesTaxTotal(
  profileId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("receipts")
    .select("sales_tax")
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (sum, receipt) => sum + Number(receipt.sales_tax ?? 0),
    0
  );
}