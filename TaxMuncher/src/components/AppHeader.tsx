import { router } from "expo-router";
import { useState } from "react";
import { View, Text } from "react-native";
import { supabase } from "@/utils/supabase";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { IconButton, Notice, s } from "./ui";
export default function AppHeader() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch {
      setError("Sign out failed. Please try again.");
    }
  }

  return (
    <>
      <View
        style={{
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.primary, fontWeight: "800", fontSize: 22 }}>
          TaxMuncher
        </Text>
        {session?.user && (
          <View style={s.row}>
            <IconButton
              name="settings-outline"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
            <IconButton
              name="log-out-outline"
              label="Sign out"
              onPress={signOut}
            />
          </View>
        )}
      </View>
      {!!error && <Notice text={error} />}
    </>
  );
}
