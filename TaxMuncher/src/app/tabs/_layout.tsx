import colors from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

const theme = colors.dark;

export default function TabsLayout() {
  const { name, activity } = useLocalSearchParams(); // Retrieve passed data
  const router = useRouter();

  useEffect(() => {
    if (!name || !activity) {
      router.replace("/"); // Redirect to entry screen if no data
    }
  }, [name, activity]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.buttonPrimary,
        tabBarInactiveTintColor: theme.secondaryText,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerShadowVisible: false,
        headerTintColor: theme.primaryText,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
        initialParams={{ name, activity }}
      />
      <Tabs.Screen
        name="receiptList"
        options={{
          headerTitle: "Receipts: " + activity,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
        initialParams={{ name, activity }}
      />
      <Tabs.Screen
        name="taxDetails"
        options={{
          headerTitle: "Details: ",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "school" : "school-outline"}
              size={24}
              color={color}
            />
          ),
        }}
        initialParams={{ name, activity }}
      />
    </Tabs>
  );
}
