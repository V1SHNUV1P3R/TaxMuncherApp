import { useAuth } from "@/src/components/AuthProvider";
import { AI_ENABLED } from "@/src/services/receiptAIService";
import MyButton from "@/src/components/MyButton";
import { useTheme } from "@/src/components/ThemeProvider";
import {
  Card,
  Heading,
  Label,
  Notice,
  s, // This is a style helper for flexbox layouts
    // How does it work? It provides a set of predefined styles for 
    // common flexbox layouts, such as row, column, center, between, etc. 
    // You can use these styles to quickly create responsive and flexible 
    // layouts without writing custom styles for each component.
  Screen,
  Title,
} from "@/src/components/ui";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Switch, View } from "react-native";
export default function Settings() {
  const { themeType, toggleTheme } = useTheme();
  const { session } = useAuth();
  const [error, setError] = useState("");
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setError("Sign out failed. Please try again.");
  }
  return (
    <Screen>
      <Title
        eyebrow="Make yourself at home"
        title="Your preferences"
        subtitle="A calmer space for your receipts and records."
      />
      <Card>
        <Heading>Your account</Heading>
        <Label muted>{session?.user.email}</Label>
        <MyButton
          title="Edit profile"
          secondary
          onPress={() => router.push("/editProfile")}
        />
        <MyButton title="Sign out" secondary onPress={signOut} />
      </Card>
      <Card>
        <View style={s.between}>
          <View style={{ flex: 1 }}>
            <Heading>Dark appearance</Heading>
            <Label muted>Warm colors, day or night.</Label>
          </View>
          <Switch
            accessibilityLabel="Dark appearance"
            value={themeType === "dark"}
            trackColor={{ false: "#DDC7B3", true: "#A55226" }}
            thumbColor="#FFFFFF"
            onValueChange={() =>
              toggleTheme().catch(() =>
                setError("Appearance changed, but could not be saved."),
              )
            }
          />
        </View>
      </Card>
      <Card accent>
        <Heading>Receipt intelligence</Heading>
        <Label muted>
          On-device text recognition is available in a native development build.
          {AI_ENABLED
            ? "Signed-in users can send receipt photos to Google Gemini for auto-fill."
            : "AI auto-fill is unavailable until a receipt analysis URL is configured."}
        </Label>
      </Card>
      <Card>
        <Heading>Your data, clearly labeled</Heading>
        <Label muted>
          Guest receipts are stored locally on this device. Signed-in receipts
          use your Supabase account. Local receipts are kept separate and are
          not automatically uploaded when you sign in.
        </Label>
        <Label muted>
          Keep your original receipts. Recorded sales tax is a starting point
          for eligibility review, not a promised deduction.
        </Label>
      </Card>
      {!!error && <Notice text={error} />}
      <Label muted>TaxMuncher / Prototype 1.0</Label>
    </Screen>
  );
}
