// AI Assistance Used
// Tool: ChatGPT (OpenAI)
// Date: 1-22-26
// Link: https://chatgpt.com/share/696a68f7-ba44-8012-b94f-7356a5349876
// Purpose: Cleaned up some code that wasn't needed(Deleted the useRouter)
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Auth from "../components/Auth";
/*
  This screen is the app's gatekeeper.

  Logic:
  - If auth is loading → show spinner
  - If logged in → redirect to tabs
  - If not logged in → show Auth UI
*/
export default function Index() {
    const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (session?.user) {
      // Replace prevents going "back" to login screen
      router.replace("/tabs/profile");
    }
  }, [router, session]);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (session?.user) {
    // Redirecting — nothing to render
    return null;
  }
  return (
      <View style={{ flex: 1 }}>
        <AppHeader />
        <Auth />
      </View>
  );
}