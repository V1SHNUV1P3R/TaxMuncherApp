import { useLocalSearchParams } from "expo-router";
import ReceiptForm from "@/src/components/ReceiptForm";
export default function EditReceipt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReceiptForm id={id} />;
}
