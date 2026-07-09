// AI Assistance Used
// Tool: ChatGPT (OpenAI)
// Date: 2026-17-03
// Link: https://chatgpt.com/share/69b9737e-28f8-8012-8ac6-88b5ce6edffc
// Purpose: Redid the styling for the textfield component, on top of enhancing it with
// new focus state and blur for UI design
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import colors from "@/styles/colors";
import defaultStyles from "@/styles/defaultStyles";

const theme = colors.dark;

type TextFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
};

const TextField: React.FC<TextFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  isPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          defaultStyles.input,
          focused && defaultStyles.inputFocused, // 👈 uses your theme system
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryText}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.toggleButton}
        >
          <Text style={[styles.toggleText, { color: theme.secondaryText }]}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TextField;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
},
  toggleButton: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
  toggleText: {
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});