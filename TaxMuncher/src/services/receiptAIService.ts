import { Platform } from "react-native";
import Constants from "expo-constants";
import { validateAnalysis, ReceiptAnalysis } from "./receiptValidation";
const endpoint = process.env.EXPO_PUBLIC_RECEIPT_AI_URL;
export const AI_ENABLED = Boolean(endpoint);
export async function analyzeReceipt(
  uri: string,
  accessToken?: string,
): Promise<ReceiptAnalysis> {
  if (!endpoint)
    throw new Error("Set up the receipt analysis server before enabling AI.");
  if (!accessToken) throw new Error("Sign in to analyze receipts with AI.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const form = new FormData();
    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      form.append("image", blob, "receipt.jpg");
    } else {
      form.append("image", {
        uri,
        name: "receipt.jpg",
        type: "image/jpeg",
      } as unknown as Blob);
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(
        typeof payload?.error === "string"
          ? payload.error
          : "Receipt analysis is unavailable. Please enter the details manually.",
      );
    }
    return validateAnalysis(await response.json());
  } finally {
    clearTimeout(timer);
  }
}
export async function recognizeReceiptText(uri: string): Promise<string> {
  if (Platform.OS === "web" || Constants.executionEnvironment === "storeClient")
    throw new Error(
      "On-device text recognition needs an Android or iOS development build. Manual entry works here.",
    );
  const { default: TextRecognition } =
    await import("@react-native-ml-kit/text-recognition");
  const result = await TextRecognition.recognize(uri);
  return result.text;
}
