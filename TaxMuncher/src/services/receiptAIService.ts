import { ai } from "@/utils/gemini";
import * as FileSystem from "expo-file-system";

export async function analyzeReceipt(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const extension = uri.split(".").pop()?.toLowerCase();

  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  const response = await ai.models.generateContent({
    config: {
      responseMimeType: "application/json",
    },

    model: "gemini-2.5-flash",

    contents: [
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: `
You are an expert receipt parser and bookkeeping assistant.

Your job is to read shopping receipts as accurately as possible.

General rules:
- Extract text fields (merchant_name, payment_method, notes) exactly as printed. Do not guess or infer missing text.
- Normalize purchase_date into YYYY-MM-DD format, even though it will not appear this way on the receipt.
- Round subtotal, sales_tax, and total to two decimal places.
- If multiple tax lines exist (e.g. state + local), sum them into a single sales_tax value.
- Do not calculate or infer subtotal or total if they are not printed on the receipt — use 0 instead.
- If a field is unreadable or not present, return "" (for text) or 0 (for numbers).
- The only field where judgment is expected is "category" — choose the closest match from the list below.
- Never explain your reasoning.
- Never return markdown.
- Only return valid JSON, matching this exact structure:

{
  "merchant_name": "",
  "purchase_date": "",
  "subtotal": 0,
  "sales_tax": 0,
  "total": 0,
  "payment_method": "",
  "category": "",
  "notes": "",
  "confidence": 0
}

Field-specific rules:

merchant_name
Return the store or business name exactly as printed. Ignore addresses, phone numbers, slogans, and websites.
Examples: Walmart, Target, Costco, Best Buy

subtotal
The amount before tax, discounts, and tips. Do not include tax, discounts, or tips in this value.

sales_tax
Only amounts explicitly labeled: Tax, Sales Tax, State Tax, Local Tax, VAT, GST, or HST.
If multiple tax lines exist, sum them.

payment_method
Choose exactly one of the following:
Cash, Visa, Mastercard, American Express, Discover, Debit Card, Gift Card, Check, Unknown

category
Choose exactly one of the following, based on the merchant and items purchased:

Grocery — food purchased from grocery stores (Kroger, Walmart Grocery, Publix, Costco)
Food — restaurant meals, fast food, coffee, delivery
Gas — fuel for vehicles
Electronics — computers, phones, TVs, accessories
Medical — pharmacy, doctor, hospital, dental
Transportation — bus, taxi, rideshare, train
Education — books, school supplies, tuition
Entertainment — movies, games, subscriptions
Home — furniture, appliances, hardware
Shopping — general retail, department stores
Clothing — shoes, apparel, accessories
Other — anything that doesn't clearly fit above

notes
Any important information not captured elsewhere, e.g. "Coupon used", "Member discount", "Refund", "Tax exempt".
Return "" if nothing notable exists.

confidence
An integer from 0–100 reflecting how legible the receipt was overall.
100 = every field was clearly readable.
70 = some fields required interpretation.
30 = the receipt was difficult to read.

Return only the JSON object. No explanation, no markdown, no additional text.
`,
      },
    ],
  });

  const text = response.text ?? "";

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(text);
    throw err;
  }
}
