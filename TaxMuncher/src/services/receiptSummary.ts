import type { Receipt } from "../data/receiptData";
export function summarizeReceipts(receipts: Receipt[], year?: string) {
  const rows = year
    ? receipts.filter((r) => r.purchase_date.slice(0, 4) === year)
    : receipts;
  const taxCents = rows.reduce(
    (sum, r) => sum + Math.round(r.sales_tax * 100),
    0,
  );
  const spentCents = rows.reduce(
    (sum, r) => sum + Math.round(r.total * 100),
    0,
  );
  const categories = rows.reduce<Record<string, number>>((group, r) => {
    group[r.category] =
      (group[r.category] || 0) + Math.round(r.sales_tax * 100);
    return group;
  }, {});
  return {
    rows,
    tax: taxCents / 100,
    spent: spentCents / 100,
    categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
  };
}
