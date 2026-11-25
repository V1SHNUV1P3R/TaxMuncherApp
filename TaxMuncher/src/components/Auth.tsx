import { useState } from "react";
import { Card, Label, Notice } from "./ui";
import TextField from "./TextField";
import MyButton from "./MyButton";
import { supabase, isBackendConfigured } from "@/utils/supabase";
export default function Auth() {
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const signingUp = mode === "signUp";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit() {
    setMessage("");
    if (!isBackendConfigured) {
      setMessage(
        "Account services are not configured. Sign-in is currently unavailable.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (!password || (signingUp && password.length < 8)) {
      setMessage(
        signingUp
          ? "Use a password with at least 8 characters."
          : "Enter your password.",
      );
      return;
    }
    setBusy(true);
    try {
      const credentials = { email: email.trim(), password };
      const { data, error } = signingUp
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
      if (
        signingUp &&
        (error?.code === "user_already_exists" ||
          error?.code === "email_exists")
      ) {
        setMode("signIn");
        setPassword("");
        setMessage(
          "This email is already registered. Sign in with your existing password.",
        );
        return;
      }
      if (!signingUp && error?.code === "user_not_found") {
        setMode("signUp");
        setMessage("Create an account with this email before signing in.");
        return;
      }
      if (!signingUp && error?.code === "invalid_credentials") {
        setMessage(
          "Check your email and password and try again. If this is your first visit, choose Sign up to create an account.",
        );
        return;
      }
      if (error) throw error;
      if (signingUp && !data.session) {
        setMode("signIn");
        setPassword("");
        setMessage(
          "If you already have an account, sign in with your existing password. For a new account, check your email to confirm it before signing in.",
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      {!!message && <Notice text={message} />}
      <TextField
        placeholder="Email address"
        value={email}
        editable={!busy}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField
        placeholder="Password"
        value={password}
        editable={!busy}
        autoComplete={signingUp ? "new-password" : "current-password"}
        onChangeText={setPassword}
        isPassword
      />
      {signingUp && (
        <Label muted>
          New here? Sign up with an email address and a password of at least 8
          characters.
        </Label>
      )}
      <MyButton
        title={busy ? "Please wait..." : signingUp ? "Sign up" : "Sign in"}
        disabled={busy}
        onPress={submit}
      />
      <MyButton
        title={
          signingUp ? "Already have an account? Sign in" : "New here? Sign up"
        }
        secondary
        disabled={busy}
        onPress={() => {
          setMode(signingUp ? "signIn" : "signUp");
          setMessage("");
        }}
      />
    </Card>
  );
}
