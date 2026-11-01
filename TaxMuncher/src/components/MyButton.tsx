import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "./ThemeProvider";
type Props = {
  title: string;
  color?: string;
  textColor?: string;
  underlayColor?: string;
  onPress?: () => void;
  onoff?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  secondary?: boolean;
};
export default function MyButton({
  title,
  color,
  textColor,
  onPress,
  icon,
  disabled,
  secondary,
}: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 16,
        backgroundColor:
          color || (secondary ? theme.card : theme.buttonPrimary),
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
        }}
      >
        {icon}
        <Text
          style={{
            color: textColor || (secondary ? theme.primaryText : "#FFFFFF"),
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
