import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Screen, Title, Card, Notice, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/components/AuthProvider";
import TextField from "@/src/components/TextField";
import MyButton from "@/src/components/MyButton";
import { supabase } from "@/utils/supabase";
export default function EditProfile() {
  const { session } = useAuth();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!session) {
      return;
    }
    let active = true;
    supabase
      .from("Profiles")
      .select("first_name,last_name,phone_number")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setMessage("Profile could not be loaded. Please try again.");
        else if (data) {
          setFirst(data.first_name || "");
          setLast(data.last_name || "");
          setPhone(data.phone_number || "");
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session]);
  async function save() {
    if (!session) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("Profiles").upsert({
        id: session.user.id,
        first_name: first.trim(),
        last_name: last.trim(),
        phone_number: phone.trim(),
      });
      if (error) throw error;
      router.back();
    } catch {
      setMessage("Your profile could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Title eyebrow="Account details" title="A little about you" />
      {message && <Notice text={message} />}
      {loading && session ? (
        <Loading />
      ) : !session ? (
        <Notice text="Sign in to manage your account profile." />
      ) : (
        <>
          <Card>
            <TextField
              placeholder="First name"
              value={first}
              onChangeText={setFirst}
            />
            <TextField
              placeholder="Last name"
              value={last}
              onChangeText={setLast}
            />
            <TextField
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </Card>
          <MyButton
            title={busy ? "Saving..." : "Save profile"}
            disabled={busy}
            onPress={save}
          />
        </>
      )}
    </Screen>
  );
}
