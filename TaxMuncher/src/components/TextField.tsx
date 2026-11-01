import { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "./ThemeProvider";
type Props = TextInputProps & { isPassword?: boolean; label?: string };
export default function TextField({
  isPassword = false,
  label,
  placeholder,
  style,
  ...props
}: Props) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8, width: "100%" }}>
      <Text
        style={{ color: theme.secondaryText, fontSize: 12, fontWeight: "600" }}
      >
        {label || placeholder}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.inputBackground,
          borderWidth: 1,
          borderColor: focused ? theme.inputFocus : theme.border,
          borderRadius: 14,
        }}
      >
        <TextInput
          {...props}
          accessibilityLabel={label || placeholder}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryText}
          secureTextEntry={isPassword && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            {
              flex: 1,
              minHeight: 52,
              padding: 15,
              fontSize: 15,
              color: theme.primaryText,
            },
            style,
          ]}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            onPress={() => setVisible(!visible)}
            style={{ padding: 14 }}
          >
            <Text style={{ color: theme.primary }}>
              {visible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
