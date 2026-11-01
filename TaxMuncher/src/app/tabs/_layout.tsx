import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/components/ThemeProvider";
export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 84,
          paddingTop: 10,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Overview",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" color={color} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="receiptList"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt-outline" color={color} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="taxDetails"
        options={{
          title: "Tax summary",
          tabBarIcon: ({ color }) => (
            <Ionicons name="pie-chart-outline" color={color} size={23} />
          ),
        }}
      />
    </Tabs>
  );
}
