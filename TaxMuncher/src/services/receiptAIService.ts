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

Never guess values.

If something is unreadable, return "" or 0.

Extract every value exactly as printed.

Normalize dates into YYYY-MM-DD format.

Round all currency values to two decimal places.

Never return markdown.

Never explain your reasoning.

Only return valid JSON.



{
  "merchant_name": "",
  "purchase_date": "",
  "subtotal": 0,
  "sales_tax": 0,
  "total": 0,
  "payment_method": "",
  "category": "",
  "notes": "",
  "confidence": 0,
}

Rules:

merchant_name

Return the store or business name exactly as printed.
Ignore addresses, phone numbers, slogans and websites.

Examples:
Walmart
Target
Costco
Best Buy

notes = Return any important information not represented elsewhere.

Examples:
Coupon used
Member discount
Refund
Tax Exempt

If nothing important exists, return "".


subtotal = The amount before taxes.

Do not include discounts.
Do not include tips.
Do not include tax.


confidence:
Return an integer from 0 to 100.
100 means every field was clearly readable.
70 means some fields required interpretation.
30 means the receipt was difficult to read.

sales_tax

Only the amount listed as:
Tax
Sales Tax
State Tax
Local Tax
VAT
GST
HST

If multiple taxes exist, add them together.

Payment must be Choose ONLY ONE:
Cash
Visa
Mastercard
American Express
Discover
Debit Card
Gift Card
Check
Unknown

Valid categories:

Grocery
Food
Gas
Electronics
Medical
Transportation
Education
Entertainment
Shopping
Home
Clothing
Other

Choose the closest category based on the merchant and purchased items.

Return exactly one category from this list.

Grocery = Food purchased from grocery stores.
Examples:
Kroger
Walmart Grocery
Publix
Costco


Food:
Restaurant meals.
Fast food.
Coffee.
Delivery.

Gas = Fuel purchased for vehicles.

Electronics:
Computers
Phones
TVs
Accessories

Medical:
Pharmacy
Doctor
Hospital
Dental


Transportation:
Bus
Taxi
Uber
Train

Education:
Books
School
Supplies
Tuition

Entertainment:
Movies
Games
Subscriptions

Home:
Furniture
Appliances
Hardware


Shopping:
General retail
Department stores

Clothing:
Shoes
Apparel
Accessories


Never modify values.
Return the exact values printed on the receipt.
Do not calculate missing numbers.
Do not infer missing values.
If a value is not visible, return 0 or "".



- If a field cannot be determined, use "" or 0.
- Do NOT explain anything.
- Do NOT use markdown.
- Output JSON only.
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