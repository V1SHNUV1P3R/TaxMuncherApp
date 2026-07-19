import colors from "@/src/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const themeMK1 = colors.dark;
const themeMK2 = colors.light;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeMK1.buttonPrimary,
        tabBarInactiveTintColor: themeMK1.secondaryText,
        headerStyle: {
          backgroundColor: themeMK1.surface,
        },
        headerShadowVisible: false,
        headerTintColor: themeMK1.primaryText,
        tabBarStyle: {
          backgroundColor: themeMK1.background,
          borderTopColor: themeMK1.border,
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
      />
      <Tabs.Screen
        name="receiptList"
        options={{
          headerTitle: "All Receipts",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="taxDetails"
        options={{
          headerShown: false,
          title: "Taxes",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calculator" : "calculator-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
