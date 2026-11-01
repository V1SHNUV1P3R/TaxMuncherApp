import { router } from "expo-router";
import { View, Text } from "react-native";
import { useTheme } from "./ThemeProvider";
import { IconButton } from "./ui";
export default function AppHeader() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ color: theme.primary, fontWeight: "800", fontSize: 22 }}>
        TaxMuncher
      </Text>
      <IconButton
        name="settings-outline"
        label="Settings"
        onPress={() => router.push("/settings")}
      />
    </View>
  );
}
