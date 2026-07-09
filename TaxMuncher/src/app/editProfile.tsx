import { useAuth } from "@/components/AuthProvider";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Profiles")
        .select("first_name, last_name, phone_number")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setPhoneNumber(data.phone_number ?? "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [session?.user?.id]);

  async function handleSave() {
    if (!session?.user) {
      Alert.alert(
        "Not signed in",
        "Please sign in before updating your profile.",
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("Profiles").upsert(
      {
        id: session.user.id,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone_number: phoneNumber.trim() || null,
      },
      { onConflict: "id" },
    );

    setSaving(false);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    Alert.alert("Profile updated", "Your Supabase profile has been updated.");
    router.back();
  }

  if (loading) {
    return (
      <View style={[defaultStyles.container, defaultStyles.centerBoth]}>
        <ActivityIndicator size="large" color={colors.dark.buttonPrimary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={defaultStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={defaultStyles.heroTitle}>Edit profile</Text>
        <Text style={[defaultStyles.subheading, { marginBottom: 20 }]}>
          This screen is the only place where these profile details can be
          changed.
        </Text>

        <View style={defaultStyles.card}>
          <Text style={defaultStyles.caption}>First name</Text>
          <TextField
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />

          <Text style={defaultStyles.caption}>Last name</Text>
          <TextField
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />

          <Text style={defaultStyles.caption}>Phone number</Text>
          <TextField
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone number"
          />
        </View>

        <TouchableOpacity
          style={[defaultStyles.primaryButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.dark.buttonText} />
          ) : (
            <Text style={defaultStyles.buttonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
