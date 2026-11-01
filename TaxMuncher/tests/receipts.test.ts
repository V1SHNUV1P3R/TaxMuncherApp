import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isValidDate,
  parseAmount,
  validateAnalysis,
} from "../src/services/receiptValidation.ts";
import { summarizeReceipts } from "../src/services/receiptSummary.ts";
import type { Receipt } from "../src/data/receiptData";
const receipt = (changes: Partial<Receipt> = {}): Receipt => ({
  id: "test",
  profile_id: "local-prototype",
  merchant_name: "Shop",
  purchase_date: "2026-10-30",
  subtotal: 1,
  sales_tax: 0.1,
  total: 1.1,
  payment_method: "Visa",
  category: "Shopping",
  ...changes,
});
test("sales tax is summed in cents and grouped by year/category", () => {
  const summary = summarizeReceipts(
    [
      receipt(),
      receipt({ sales_tax: 0.2, total: 2.2 }),
      receipt({ purchase_date: "2025-12-31", sales_tax: 50 }),
    ],
    "2026",
  );
  assert.equal(summary.tax, 0.3);
  assert.equal(summary.spent, 3.3);
  assert.equal(summary.rows.length, 2);
  assert.deepEqual(summary.categories, [["Shopping", 30]]);
});
test("removing and editing a receipt changes totals", () => {
  const rows = [receipt(), receipt({ id: "second", sales_tax: 2 })];
  assert.equal(summarizeReceipts(rows).tax, 2.1);
  assert.equal(
    summarizeReceipts(rows.filter((r) => r.id !== "second")).tax,
    0.1,
  );
  assert.equal(
    summarizeReceipts(rows.map((r) => ({ ...r, sales_tax: 1 }))).tax,
    2,
  );
  assert.equal(summarizeReceipts([]).tax, 0);
});
test("amounts reject blanks, negatives, NaN, exponent notation and excess precision", () => {
  for (const v of ["", "-1", "NaN", "Infinity", "1e3", "1.001", "1,200"])
    assert.throws(() => parseAmount(v));
  assert.equal(parseAmount("0"), 0);
  assert.equal(parseAmount("12.35"), 12.35);
});
test("dates reject rollover and accept leap days", () => {
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2026-1-1"), false);
});
test("AI payloads must include typed amounts and bounded confidence", () => {
  const valid = { ...receipt(), notes: "", confidence: 90 };
  assert.equal(validateAnalysis(valid).sales_tax, 0.1);
  for (const changes of [
    { sales_tax: "5" },
    { total: null },
    { confidence: 101 },
    { category: "Invented" },
    { purchase_date: "2026-02-30" },
  ])
    assert.throws(() => validateAnalysis({ ...valid, ...changes }));
});
