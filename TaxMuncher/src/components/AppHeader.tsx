// AI Assistance Used
// Tool: ChatGPT (OpenAI)
// Date: 2026-01-04
// Link: https://chat.openai.com/share/XXXXXXXX
// Purpose: Redid the styling for the app header, with a new color scheme and layout.
// Notes: Mini style sheet is now updated with the right looks.
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "@/src/styles/colors";
import { supabase } from "../../utils/supabase";

const theme = colors.dark;

function getTitleFromPath(pathname: string) {
  if (pathname === "/") return "Welcome";
  if (pathname.includes("index")) return "Home";
  if (pathname.includes("editProfile")) return "Settings";
  if (pathname.includes("profile")) return "Edit Profile";
  return "App";
}

export default function AppHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  // Read global state (we DON'T change it here, just read it)


  async function handleLogout() {
  // // If a game is active, block logout
  // if (gameRunning) {
  //   Alert.alert(
  //     "Game in progress",
  //     "Finish or stop your timer before logging out."
  //   );
  //   return; // stop function here
  // }

  // Otherwise, proceed normally
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout failed", error.message);
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
          source={require("../assets/images/react-logo.png")}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
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
    height: 90,
    paddingHorizontal: 16,
    backgroundColor: "#3A3332", // ⭐ darker/intense grey
    flexDirection: "row",
    alignItems: "flex-end",
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
    color: theme.buttonPrimary, // ⭐ purple accent
    marginLeft: 10,
  },

  imageLogo: {
    height: 30,
    width: 30,
    marginBottom: 6,
  },

  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
});