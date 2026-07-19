// AI Assistance Used
// Tool: Gemini
// Date: 2026-07-18
// Purpose: Fix logout function redirect and fix alignment layout so button is clickable.
import colors from "@/src/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, router } from "expo-router"; // 👈 Added router
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

const theme = colors.dark;

function getTitleFromPath(pathname: string) {
  if (pathname === "/") return "Welcome";
  if (pathname.includes("index")) return "Home";
  if (pathname.includes("settings")) return "Settings";
  if (pathname.includes("editProfile")) return "Edit Profile";
  if (pathname.includes("profile")) return "Profile";
  return "App";
}

export default function AppHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        Alert.alert("Logout failed", error.message);
      } else {
        // 👈 Redirect user back to the welcome/index screen on success
        router.replace("/");
      }
    } catch (err: any) {
      Alert.alert("Logout failed", err?.message ?? String(err));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Image
          style={styles.imageLogo}
          source={require("../../assets/images/react-logo.png")}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7} // Gives visual feedback when pressed
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={theme.primaryText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100, // Slightly increased to accommodate padding comfortably
    paddingHorizontal: 16,
    paddingBottom: 12, // 👈 Safe padding for physical devices
    backgroundColor: "#3A3332", 
    flexDirection: "row",
    alignItems: "flex-end", // Kept alignment, but padding ensures it stays inside boundaries
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.buttonPrimary, 
    marginLeft: 10,
    bottom: -2, // Slight adjustment to line up perfectly with the logo baseline
  },

  imageLogo: {
    height: 30,
    width: 30,
  },

  logoutButton: {
    padding: 10, // Increased touch target area (Apple & Android guidelines recommend min 44x44px total target)
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});