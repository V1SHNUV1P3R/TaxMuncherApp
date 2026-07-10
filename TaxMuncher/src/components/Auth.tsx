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
  <View style={defaultStyles.screen}>
    <View style={[defaultStyles.flex, defaultStyles.center]}>

      <Text style={defaultStyles.heroTitle}>
        Receipt Tracker
      </Text>

      <Text
        style={[
          defaultStyles.subheading,
          {
            textAlign: "center",
            marginTop: 10,
            marginBottom: 40,
          },
        ]}
      >
        Sign in to continue managing your receipts and expenses.
      </Text>

      <View
        style={[
          defaultStyles.card,
          {
            width: "100%",
            maxWidth: 420,
          },
        ]}
      >
        <Text style={defaultStyles.caption}>Email</Text>

        <View style={{ marginTop: 8, marginBottom: 18 }}>
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={defaultStyles.caption}>Password</Text>

        <View style={{ marginTop: 8 }}>
          <TextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
        </View>

        <Text
          style={[
            defaultStyles.small,
            {
              marginBottom: 24,
              marginTop: 4,
            },
          ]}
        >
          Password must contain at least 6 characters and one number.
        </Text>

        <View style={{ gap: 14 }}>
          <MyButton
            title="Login"
            onPress={signInWithEmail}
            color={themeMK1.buttonPrimary}
          />

          <MyButton
            title="Create Account"
            onPress={signUpWithEmail}
            color={themeMK1.secondary}
            textColor={themeMK1.primaryText}
          />
        </View>
      </View>

      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        style={{
          width: 90,
          height: 90,
          marginTop: 35,
          opacity: 0.9,
        }}
      />

    </View>
  </View>
);
}
