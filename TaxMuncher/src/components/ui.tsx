import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeProvider";
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export function Screen({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 40,
          width: "100%",
          maxWidth: 760,
          alignSelf: "center",
          gap: 20,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Title({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <View style={s.between}>
        <View style={{ flex: 1 }}>
          {eyebrow && (
            <Text
              style={{
                color: theme.primary,
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 2,
                marginBottom: 10,
              }}
            >
              {eyebrow.toUpperCase()}
            </Text>
          )}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              letterSpacing: -1,
              color: theme.primaryText,
            }}
          >
            {title}
          </Text>
        </View>
        {action}
      </View>
      {subtitle && (
        <Text
          style={{ color: theme.secondaryText, fontSize: 14, lineHeight: 22 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
export function Card({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        padding: 22,
        borderRadius: 24,
        backgroundColor: accent ? theme.card : theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 14,
      }}
    >
      {children}
    </View>
  );
}
export function Label({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: muted ? theme.secondaryText : theme.primaryText,
        fontSize: 14,
        lineHeight: 22,
      }}
    >
      {children}
    </Text>
  );
}
export function Heading({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: theme.primaryText,
        fontSize: 19,
        fontWeight: "700",
        letterSpacing: -0.4,
      }}
    >
      {children}
    </Text>
  );
}
export function IconButton({
  name,
  onPress,
  label,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  label: string;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={name} size={22} color={theme.primary} />
    </Pressable>
  );
}
export function Notice({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 16,
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Ionicons
        name="information-circle-outline"
        size={20}
        color={theme.primary}
      />
      <View style={{ flex: 1 }}>
        <Label muted>{text}</Label>
      </View>
    </View>
  );
}
export function Loading() {
  const { theme } = useTheme();
  return <ActivityIndicator color={theme.primary} style={{ padding: 32 }} />;
}
export const s = StyleSheet.create({
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});
