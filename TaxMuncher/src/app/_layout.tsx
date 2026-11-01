import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/src/components/ThemeProvider";
import { Loading } from "@/src/components/ui";
import { AuthProvider, useAuth } from "@/src/components/AuthProvider";
function Navigation() {
  const { theme, themeType } = useTheme();
  const { isLoading } = useAuth();
  if (isLoading) return <Loading />;
  return (
    <>
      <StatusBar style={themeType === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primaryText,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="addReceipt" options={{ title: "New receipt" }} />
        <Stack.Screen
          name="receiptDetails"
          options={{ title: "Receipt details" }}
        />
        <Stack.Screen name="editReceipt" options={{ title: "Edit receipt" }} />
        <Stack.Screen name="editProfile" options={{ title: "Your profile" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="signIn" options={{ title: "Account" }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
