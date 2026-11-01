import { useState } from "react";
import { Switch, View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Title,
  Card,
  Heading,
  Label,
  Notice,
  s,
} from "@/src/components/ui";
import { useAuth } from "@/src/components/AuthProvider";
import { useTheme } from "@/src/components/ThemeProvider";
import MyButton from "@/src/components/MyButton";
import { supabase } from "@/utils/supabase";
export default function Settings() {
  const { themeType, toggleTheme } = useTheme();
  const { session } = useAuth();
  const [error, setError] = useState("");
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setError("Sign out failed. Please try again.");
    else router.replace("/");
  }
  return (
    <Screen>
      <Title
        eyebrow="Make yourself at home"
        title="Your preferences"
        subtitle="A calmer space for your receipts and records."
      />
      <Card>
        <Heading>{session ? "Your account" : "Local prototype"}</Heading>
        <Label muted>
          {session?.user.email ||
            "Try the complete receipt workflow without creating an account."}
        </Label>
        {session ? (
          <>
            <MyButton
              title="Edit profile"
              secondary
              onPress={() => router.push("/editProfile")}
            />
            <MyButton title="Sign out" secondary onPress={signOut} />
          </>
        ) : (
          <MyButton
            title="Sign in or create account"
            secondary
            onPress={() => router.push("/signIn")}
          />
        )}
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
          Google AI Studio integration is prepared and remains disconnected
          until setup is complete.
        </Label>
        <Notice text="Your AI key and .env have not been changed. No live AI requests are made." />
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
      {error && <Notice text={error} />}
      <Label muted>TaxMuncher / Prototype 1.0</Label>
    </Screen>
  );
}
