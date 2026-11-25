// ============================================================================
// 1. IMPORTS: Navigation, Icons, Core React Native UI, and Custom Components
// ============================================================================

// 'router' lets you navigate via functions (e.g., on button press).
// 'Redirect' is a component that immediately sends the user to another route when rendered.
import { router, Redirect } from "expo-router";

// Pre-packaged icon library included with Expo
import { Ionicons } from "@expo/vector-icons";

// Core React Native building blocks for displaying text, containers (View), and CSS-like styles
import { Text, View } from "react-native";

// Custom reusable components built specifically for your project ("@/" points to your project root)
import AppHeader from "@/src/components/AppHeader";
import MyButton from "@/src/components/MyButton";
import {
  Card,
  Heading,
  Label,
  Loading,
  Screen,
  Title,
} from "@/src/components/ui";

// Custom React Context hooks for checking login state (useAuth) and dark/light colors (useTheme)
import { useAuth } from "@/src/components/AuthProvider";
import { useTheme } from "@/src/components/ThemeProvider";

// Shared app styles and brand colors
import defaultStyles from "@/src/styles/defaultStyles";

// ============================================================================
// 2. STATIC DATA: Feature list displayed inside the main card
// ============================================================================

// Defining this array outside the component prevents React from recreating it on every re-render.
// 'as const' tells TypeScript that the icon string is an exact Ionicons name, not just any random string.
const features = [
  {
    icon: "scan-outline" as const,
    title: "Keep receipts together",
    description: "Save receipt details in one easy-to-find place.",
  },
  {
    icon: "pie-chart-outline" as const,
    title: "See the bigger picture",
    description: "Review spending and sales tax totals as you go.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Stay in control",
    description: "Check and edit details before relying on your records.",
  },
];

// ============================================================================
// 3. MAIN COMPONENT: The Welcome / Onboarding Screen (app/index.tsx)
// ============================================================================

export default function Index() {
  // Pulls the current user's Supabase session and loading status from your AuthProvider
  const { session, isLoading } = useAuth();

  // Pulls dynamic colors (like background, surface, text colors) from your ThemeProvider
  const { theme } = useTheme();

  // GUARD 1: While checking if the user is already logged in on their device, show a spinner
  if (isLoading) return <Loading />;

  // GUARD 2: If a logged-in user exists in the session, skip this welcome screen
  // and automatically redirect them straight into the app's profile tab.
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
        subtitle="Keep your purchases together, follow your sales tax, and feel more prepared when it is time to review your records."
      />

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

      {/* SECTION HEADER: Introduces the features list */}
      <View style={defaultStyles.landingSectionHeading}>
        <Heading>Made for the little details</Heading>
        <Label muted>A simpler routine, from purchase to review.</Label>
      </View>

      {/* FEATURES CARD: Loops through the 'features' array above to build 3 rows */}
      <Card accent>
        {features.map((feature, index) => (
          <View
            key={feature.title} // Unique key required by React when rendering lists
            style={[
              defaultStyles.landingFeatureRow,
              // Adds a bottom divider line to every item EXCEPT the last one
              index < features.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
          >
            {/* Rounded square box holding the left-side icon */}
            <View
              style={[
                defaultStyles.landingFeatureIcon,
                { backgroundColor: theme.surface },
              ]}
            >
              <Ionicons name={feature.icon} size={22} color={theme.primary} />
            </View>

            {/* Right-side column holding the feature title and description */}
            <View style={defaultStyles.landingFeatureCopy}>
              <Text
                style={[
                  defaultStyles.landingFeatureTitle,
                  { color: theme.primaryText },
                ]}
              >
                {feature.title}
              </Text>
              <Text
                style={[
                  defaultStyles.landingFeatureDescription,
                  defaultStyles.secondaryButton,
                  { color: theme.secondaryText },
                ]}
              >
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* BOTTOM ACTION BUTTONS: Sign In or Guest Exploration */}
      <View style={defaultStyles.landingActions}>
        {/* Primary button: Pushes the '/signIn' screen onto the navigation stack (allows going "Back") */}
        <MyButton
          title="Get started"
          icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          onPress={() => router.push("/signIn")}
        />

        {/* Secondary button: Replaces the current screen with '/tabs/profile' so they can browse as a guest */}
        <MyButton
          title="Explore the app"
          onPress={() => router.replace("/tabs/profile")}
        />

        {/* Small disclaimer text under the buttons */}
        <Text
          style={[
            defaultStyles.landingFootnote,
            { color: theme.secondaryText },
          ]}
        >
          This is a prototype, not the final product.
          Will need to do further testing and enhancements
          Before its ready
        </Text>
      </View>
    </Screen>
  );
}
