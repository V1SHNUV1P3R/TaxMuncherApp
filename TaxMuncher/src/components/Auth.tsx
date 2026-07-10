// Auth UI component
import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const themeMK2 = colors.light;

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
    router.push("/profile");
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
      router.push("/profile");
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
      <TextField placeholder="Email" value={email} onChangeText={setEmail} />

      <TextField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        isPassword
      />
      <Text style={defaultStyles.passwordText}>
        Password needs to be greater than 6 characters & have at least 1 number.
      </Text>

      <MyButton
        title="Sign Up"
        onPress={signUpWithEmail}
        color={themeMK1.accentBlue}
      />
      <MyButton
        title="Login"
        onPress={signInWithEmail}
        color={themeMK1.accentBlue}
      />

      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        style={defaultStyles.startingTitle}
      />
    </View>
  );
}
