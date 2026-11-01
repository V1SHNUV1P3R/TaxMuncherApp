import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "./AuthProvider";
import { Receipt } from "@/src/data/receiptData";
import { DEMO_PROFILE, getReceipts } from "@/src/services/receiptService";
export function useReceipts() {
  const { session } = useAuth();
  const profileId = session?.user.id || DEMO_PROFILE;
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void revision;
      let active = true;
      setLoading(true);
      getReceipts(profileId)
        .then((r) => {
          if (active) {
            setReceipts(r);
            setError("");
          }
        })
        .catch(() => {
          if (active)
            setError("Receipts could not be loaded. Please try again.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [profileId, revision]),
  );
  return {
    receipts,
    loading,
    error,
    profileId,
    reload: () => setRevision((n) => n + 1),
    isDemo: profileId === DEMO_PROFILE,
  };
}
