import { Platform } from "react-native";
import Constants from "expo-constants";
import { validateAnalysis, ReceiptAnalysis } from "./receiptValidation";
// AI is intentionally disconnected until integration is requested. No key is read.
export const AI_ENABLED = false;
export async function analyzeReceipt(uri: string): Promise<ReceiptAnalysis> {
  if (!AI_ENABLED)
    throw new Error(
      "AI integration is not connected yet. You can still save a receipt manually.",
    );
  const endpoint = process.env.EXPO_PUBLIC_RECEIPT_AI_URL;
  if (!endpoint)
    throw new Error("Set up the receipt analysis server before enabling AI.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
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
      body: form,
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(
        "Receipt analysis is unavailable. Please enter the details manually.",
      );
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
