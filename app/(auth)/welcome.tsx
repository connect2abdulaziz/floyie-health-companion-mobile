import { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { floyieLogo } from "@/lib/assets";

const BRAND_GRADIENT = ["#6ee5f7", "#5bc4f0", "#5b8def", "#6666e6", "#7846d4", "#9333ea"] as const;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <LinearGradient
        colors={BRAND_GRADIENT}
        style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="mt-4 text-xl text-white">Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (user) {
    return null;
  }

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      style={[
        styles.gradient,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingLeft: 24 + insets.left,
          paddingRight: 24 + insets.right,
        },
      ]}
    >
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-md items-center">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={floyieLogo}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="FLOYIE"
            />
          </View>

          {/* Title & tagline */}
          <Text className="mb-4 text-center text-4xl font-bold tracking-wide text-white" style={styles.titleShadow}>
            FLOYIE
          </Text>
          <Text className="mb-2 text-center text-xl text-white/90">
            Your AI-Powered Blood Pressure Companion
          </Text>
          <Text className="mb-2 text-center text-base text-white/70">
            Track, analyze, and manage your cardiovascular health
          </Text>

          {/* CTAs */}
          <View className="mt-8 w-full gap-4">
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity
                activeOpacity={0.9}
                className="h-14 w-full items-center justify-center rounded-xl bg-primary"
                style={styles.primaryButton}
              >
                <Text className="text-lg font-bold text-white">Create Account</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                activeOpacity={0.9}
                className="h-14 w-full items-center justify-center rounded-xl border border-white/30 bg-white/10"
              >
                <Text className="text-lg font-semibold text-white">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer */}
          <View className="mt-8 flex-row items-center gap-2">
            <Ionicons name="heart" size={16} color="rgba(255,255,255,0.6)" />
            <Text className="text-sm text-white/60">Your health, simplified</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  logoContainer: {
    marginBottom: 32,
    width: 192,
    height: 192,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleShadow: {
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  primaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
