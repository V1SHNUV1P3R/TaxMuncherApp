import { useAuth } from "@/src/components/AuthProvider";
import MyButton from "@/src/components/MyButton";
import TextField from "@/src/components/TextField";
import colors from "@/src/styles/colors";
import defaultStyles from "@/src/styles/defaultStyles";
import { useBackHandler } from "@/src/components/useBackHandler"; // 👈 Imported your hook
import { supabase } from "@/utils/supabase";
import { useRouter, useNavigation } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Track database states to detect accurate value modifications
  const initialData = useRef({ first_name: "", last_name: "", phone_number: "" });
  const isSaving = useRef(false);

  useEffect(() => {
    let ignore = false;

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

      if (!ignore) {
        if (error) {
          console.warn("Failed to load profile", error);
        }

        const fName = data?.first_name ?? "";
        const lName = data?.last_name ?? "";
        const pNum = data?.phone_number ?? "";

        setFirstName(fName);
        setLastName(lName);
        setPhoneNumber(pNum);

        initialData.current = { first_name: fName, last_name: lName, phone_number: pNum };
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  // 👈 Calculate if changes exist compared to what is currently saved in database
  const isDirty =
    firstName !== initialData.current.first_name ||
    lastName !== initialData.current.last_name ||
    phoneNumber !== initialData.current.phone_number;

  // 👈 Using your shared helper hook
  useBackHandler(isDirty, isSaving);

  async function saveProfile() {
    if (!session?.user) {
      Alert.alert("Please sign in before updating your profile.");
      return;
    }

    isSaving.current = true;

    const { error } = await supabase.from("Profiles").upsert({
      id: session.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phoneNumber.trim(),
    });

    if (error) {
      Alert.alert(error.message);
      isSaving.current = false;
      return;
    }

    Alert.alert("Profile updated");
    router.back();
  }

  if (loading) {
    return (
      <View style={[defaultStyles.container, defaultStyles.center]}>
        <ActivityIndicator size="large" color={colors.dark.buttonPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={defaultStyles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={defaultStyles.heroTitle}>Edit Profile</Text>
      <Text style={defaultStyles.subheading}>
        Update the details shown in your account.
      </Text>

      <View style={{ marginTop: 24, gap: 10 }}>
        <TextField
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextField
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextField
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <View style={{ marginTop: 24 }}>
        <MyButton
          title="Save Changes"
          onPress={saveProfile}
          color={colors.dark.buttonPrimary}
        />
      </View>
    </ScrollView>
  );
}