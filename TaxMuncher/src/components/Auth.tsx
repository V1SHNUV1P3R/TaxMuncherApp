import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Screen, Title, Card, Label, Notice } from "./ui";
import TextField from "./TextField";
import MyButton from "./MyButton";
import { useAuth } from "./AuthProvider";
import { supabase, isBackendConfigured } from "@/utils/supabase";
export default function Auth() {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (session) router.replace("/tabs/profile");
  }, [session]);
  async function submit(signUp: boolean) {
    setMessage("");
    if (!isBackendConfigured) {
      setMessage(
        "Account services are not configured. You can continue with the local prototype.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (!password || (signUp && password.length < 8)) {
      setMessage(
        signUp
          ? "Use a password with at least 8 characters."
          : "Enter your password.",
      );
      return;
    }
    setBusy(true);
    try {
      const { data, error } = signUp
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
      if (error) throw error;
      if (data.session) router.replace("/tabs/profile");
      else
        setMessage("Check your email to confirm your account, then sign in.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Sign in failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Title
        eyebrow="Welcome to TaxMuncher"
        title="Less paper.\nMore peace of mind."
        subtitle="Sign in to keep your receipt records with your account."
      />
      {message && <Notice text={message} />}
      <Card>
        <TextField
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        <Label muted>
          New accounts need a password with at least 8 characters.
        </Label>
        <MyButton
          title={busy ? "Please wait..." : "Sign in"}
          disabled={busy}
          onPress={() => submit(false)}
        />
        <MyButton
          title="Create an account"
          secondary
          disabled={busy}
          onPress={() => submit(true)}
        />
      </Card>
      <MyButton
        title="Continue with local prototype"
        secondary
        onPress={() => router.replace("/tabs/profile")}
      />
    </Screen>
  );
}
