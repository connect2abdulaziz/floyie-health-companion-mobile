import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/services/supabase";
import { floyieLogo } from "@/lib/assets";
import { Input } from "@/components/ui/Input";

const BRAND_GRADIENT = ["#6ee5f7", "#5bc4f0", "#5b8def", "#6666e6", "#7846d4", "#9333ea"] as const;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: undefined,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Something went wrong.");
      return;
    }
    setSent(true);
  };

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 24 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-4 mr-auto flex-row items-center rounded-lg py-2 pr-3"
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text className="ml-2 text-base text-white">Back to Login</Text>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <View className="items-center px-6 pt-6 pb-2">
            <Image source={floyieLogo} style={{ width: 112, height: 112 }} contentFit="contain" />
            <Text className="mt-4 text-2xl font-bold text-gray-900">Reset Password</Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
            </Text>
          </View>
          <View className="px-6 pb-6 pt-4">
            {sent ? (
              <View className="items-center gap-4">
                <Text className="text-center text-gray-600">
                  We've sent a link to <Text className="font-semibold">{email}</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="h-12 w-full items-center justify-center rounded-xl bg-primary"
                  activeOpacity={0.9}
                >
                  <Text className="text-base font-semibold text-white">Return to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {error ? <Text className="mb-3 text-sm text-red-500">{error}</Text> : null}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="h-12 w-full items-center justify-center rounded-xl bg-primary"
                  activeOpacity={0.9}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Send Reset Link</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
