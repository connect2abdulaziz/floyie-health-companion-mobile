import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { floyieLogo } from "@/lib/assets";
import { Input } from "@/components/ui/Input";

const BRAND_GRADIENT = ["#6ee5f7", "#5bc4f0", "#5b8def", "#6666e6", "#7846d4", "#9333ea"] as const;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message ?? "Login failed.");
      return;
    }
    router.replace("/(tabs)/dashboard");
  };

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 24 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 mr-auto flex-row items-center rounded-lg py-2 pr-3"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text className="ml-2 text-base text-white">Back</Text>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center py-8">
            <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
              <View className="items-center px-6 pt-6 pb-2">
                <Image source={floyieLogo} style={{ width: 112, height: 112 }} contentFit="contain" />
                <Text className="mt-4 text-2xl font-bold text-gray-900">Welcome Back</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">Log in to continue tracking your health</Text>
              </View>
              <View className="px-6 pb-6 pt-4">
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <View className="mb-4 items-end">
                  <Link href="/(auth)/forgot-password" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                      <Text className="text-sm font-medium text-primary">Forgot password?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
                {error ? <Text className="mb-3 text-sm text-red-500">{error}</Text> : null}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="h-12 w-full items-center justify-center rounded-xl bg-primary"
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-base font-semibold text-white">Log In</Text>
                  )}
                </TouchableOpacity>
                <View className="mt-6 flex-row justify-center">
                  <Text className="text-sm text-gray-600">Don't have an account? </Text>
                  <Link href="/(auth)/signup" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                      <Text className="text-sm font-semibold text-primary">Create one</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
