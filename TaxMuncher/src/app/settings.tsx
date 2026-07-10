import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ProfileData = {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  avatar?: string | null;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Profiles")
        .select("first_name, last_name, phone_number, avatar")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.warn("Failed to load settings profile", error);
      }

      setProfile(data ?? null);
      setLoading(false);
    }

    loadProfile();
  }, [session?.user?.id]);

  const settingsItems = [
    {
      id: "profile",
      label: "Profile",
      subtitle:
        profile?.first_name || profile?.last_name
          ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
          : "Tap to edit your details",
      icon: "person-circle-outline" as const,
      onPress: () => router.push({ pathname: "/editProfile" } as any),
    },
    {
      id: "phone",
      label: "Phone number",
      subtitle: profile?.phone_number ?? "Not added yet",
      icon: "call-outline" as const,
      onPress: () => router.push({ pathname: "/editProfile" } as any),
    },
    {
      id: "email",
      label: "Email",
      subtitle: session?.user?.email ?? "Unavailable",
      icon: "mail-outline" as const,
      onPress: () =>
        Alert.alert("Email", "Your email is managed by Supabase auth."),
    },
  ];

  if (loading) {
    return (
      <View style={[defaultStyles.container, defaultStyles.center]}>
        <ActivityIndicator size="large" color={colors.dark.buttonPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={defaultStyles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerCard}>
        <View style={styles.avatarBadge}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.dark.buttonText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={defaultStyles.heroTitle}>Settings</Text>
          <Text style={[defaultStyles.subheading, { marginTop: 4 }]}>
            Keep your account details up to date in one place.
          </Text>
        </View>
      </View>

      <View style={styles.sectionLabel}>
        <Text style={defaultStyles.caption}>ACCOUNT</Text>
      </View>

      {settingsItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.settingRow}
          onPress={item.onPress}
        >
          <View style={styles.iconWrap}>
            <Ionicons
              name={item.icon}
              size={22}
              color={colors.dark.primaryText}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={defaultStyles.body}>{item.label}</Text>
            <Text style={[defaultStyles.caption, { marginTop: 2 }]}>
              {item.subtitle}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.dark.secondaryText}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.dark.buttonPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});