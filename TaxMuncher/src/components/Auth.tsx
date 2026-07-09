// Auth UI component
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    AppState,
    AppStateStatus,
    Image,
    Text,
    View,
} from "react-native";
import MyButton from "./MyButton";
import TextField from "./TextField";

export default function Auth({ noHeader }: { noHeader?: boolean } = {}) {
  const [email, setEmail] = useState("@gmail.com");
  const [password, setPassword] = useState("123456");

  const router = useRouter();
  const themeMK1 = colors.dark;

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        try {
          supabase.auth.stopAutoRefresh();
        } catch {}
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    if (AppState.currentState === "active") {
      supabase.auth.startAutoRefresh();
    }

    return () => {
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      }
      try {
        supabase.auth.stopAutoRefresh();
      } catch {}
    };
  }, []);

  async function signInWithEmail() {
    if (isValidInput()) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert(error.message);
      }

      // AI Assistance Used
      // Tool: Microsoft Copilot (GitHub Copilot)
      // Date: 03-19-26
      // Purpose: Have it fix an issue with the router not working after login.
      router.push("/tabs/profile");
    }
  }

  async function signUpWithEmail() {
    if (isValidInput()) {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Alert.alert(error.message);
      }
      // AI Assistance Used
      // Tool: Microsoft Copilot (GitHub Copilot)
      // Date: 03-19-26
      // Purpose: Have it fix an issue with the router not working after login.
      router.push("/tabs/profile");
    }
  }

  const isValidInput = () => {
    if (!email || !password) {
      console.log("Email and password cannot be empty");
      return false;
    }

    if (password.length < 6) {
      console.log("Password must be at least 6 characters");
      return false;
    }

    if (!/\d/.test(password)) {
      console.log("Password must contain a number");
      return false;
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      console.log("Email must be a Gmail address");
      Alert.alert("Invalid email", "Please use a @gmail.com email address");
      return false;
    }
    return true;
  };

  return (
    <View style={defaultStyles.startingContainer}>
      <View style={defaultStyles.authLogoContainer}>
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          style={defaultStyles.startingTitle}
        />

        <Text style={defaultStyles.heroTitle}>ReceiptAI</Text>

        <Text style={defaultStyles.authSubtitle}>
          AI-powered receipt scanning, expense tracking, and tax organization.
        </Text>
      </View>

      <TextField placeholder="Email" value={email} onChangeText={setEmail} />

      <TextField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      <Text style={defaultStyles.passwordText}>
        Password must contain at least 6 characters and one number.
      </Text>

      <MyButton
        title="Login"
        onPress={signInWithEmail}
        color={themeMK1.buttonPrimary}
      />

      <View style={defaultStyles.buttonSpacing} />

      <MyButton
        title="Create Account"
        onPress={signUpWithEmail}
        color={themeMK1.buttonSecondary}
        textColor={themeMK1.primaryText}
      />

      <View style={defaultStyles.authFooter}>
        <Text style={defaultStyles.footerText}>Secure • AI Powered • Fast</Text>
      </View>
    </View>
  );
}
