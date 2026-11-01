import type { Receipt } from "../data/receiptData";
export const CATEGORIES = [
  "Grocery",
  "Food",
  "Gas",
  "Electronics",
  "Medical",
  "Transportation",
  "Education",
  "Entertainment",
  "Home",
  "Shopping",
  "Clothing",
  "Other",
];
export type ReceiptAnalysis = Pick<
  Receipt,
  | "merchant_name"
  | "purchase_date"
  | "subtotal"
  | "sales_tax"
  | "total"
  | "payment_method"
  | "category"
  | "notes"
> & { confidence: number };
export function validateAnalysis(value: unknown): ReceiptAnalysis {
  if (!value || typeof value !== "object")
    throw new Error("The AI response was not a receipt.");
  const r = value as Record<string, unknown>;
  for (const key of [
    "merchant_name",
    "purchase_date",
    "payment_method",
    "category",
    "notes",
  ])
    if (typeof r[key] !== "string")
      throw new Error("The AI returned incomplete receipt fields.");
  for (const key of ["subtotal", "sales_tax", "total", "confidence"])
    if (
      typeof r[key] !== "number" ||
      !Number.isFinite(r[key]) ||
      Number(r[key]) < 0
    )
      throw new Error("The AI returned invalid amounts.");
  if (Number(r.confidence) > 100 || !CATEGORIES.includes(String(r.category)))
    throw new Error("The AI returned invalid receipt metadata.");
  if (r.purchase_date !== "" && !isValidDate(String(r.purchase_date)))
    throw new Error("The AI returned an invalid date.");
  return r as ReceiptAnalysis;
}
export function isValidDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function parseAmount(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim()))
    throw new Error("Use a positive amount with up to two decimal places.");
  const n = Number(value);
  if (!Number.isFinite(n) || n > 99999999)
    throw new Error("Amount is out of range.");
  return n;
}

export function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
