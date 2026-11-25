// ============================================================================
// 1. IMPORTS: Navigation, Icons, Core React Native UI, and Custom Components
// ============================================================================

// 'Redirect' is a component that immediately sends the user to another route when rendered.
import { Redirect } from "expo-router";

// Pre-packaged icon library included with Expo
import { Ionicons } from "@expo/vector-icons";

// Core React Native building blocks for displaying text, containers (View), and CSS-like styles
import { Text, View } from "react-native";

// Custom reusable components built specifically for your project ("@/" points to your project root)
import AppHeader from "@/src/components/AppHeader";
import Auth from "@/src/components/Auth";
import { Screen, Title } from "@/src/components/ui";

// Current Supabase session
import { useAuth } from "@/src/components/AuthProvider";

// Shared app styles and brand colors
import defaultStyles from "@/src/styles/defaultStyles";

// ============================================================================
// 3. MAIN COMPONENT: The Welcome / Onboarding Screen (app/index.tsx)
// ============================================================================

export default function Index() {
  // Pulls the current user's Supabase session and loading status from your AuthProvider
  const { session } = useAuth();

  if (session?.user) return <Redirect href="/tabs/profile" />;

  // If not loading and not logged in, render the welcome screen below:
  return (
    // <Screen> is your custom wrapper (likely handles SafeAreaView and scrolling)
    <Screen>
      {/* Top branding/navigation bar */}
      <AppHeader />

      {/* Main page header with a small eyebrow label, big multi-line title, and subtitle */}
      <Title
        eyebrow="A calmer way to stay organized"
        title={"Make every receipt\ncount."} // "\n" forces a line break
        subtitle="Sign in or create an account to keep your receipts and track your sales tax."
      />
      <Auth />

      {/* HERO BANNER: The rust-colored callout box */}
      <View style={defaultStyles.landingHero}>
        {/* Row containing the small sparkle icon and uppercase eyebrow text */}
        <View style={defaultStyles.landingHeroEyebrow}>
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={defaultStyles.landingHeroEyebrowText.color}
          />
          <Text style={defaultStyles.landingHeroEyebrowText}>
            YOUR RECEIPTS, IN ONE PLACE
          </Text>
        </View>

        {/* Main large white headline inside the hero card */}
        <Text style={defaultStyles.landingHeroTitle}>
          Less paper.{`\n`}More peace of mind.
        </Text>

        {/* Supporting paragraph inside the hero card */}
        <Text style={defaultStyles.landingHeroDescription}>
          Start with a photo or add details yourself. Your records stay clear,
          organized, and ready for your review.
        </Text>
      </View>
    </Screen>
  );
}
