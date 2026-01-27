import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import type { AuthRole } from "@/hooks/useAuth";
import { floyieLogo } from "@/lib/assets";
import { Input } from "@/components/ui/Input";

const BRAND_GRADIENT = ["#6ee5f7", "#5bc4f0", "#5b8def", "#6666e6", "#7846d4", "#9333ea"] as const;

const ROLES: { value: AuthRole; label: string }[] = [
  { value: "user", label: "Patient / User" },
  { value: "caregiver", label: "Caregiver / Family" },
  { value: "doctor", label: "Healthcare Provider" },
];

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in name, email, and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, name.trim(), role);
    setLoading(false);
    if (err) {
      setError(err.message ?? "Sign up failed.");
      return;
    }
    router.replace("/(tabs)/dashboard");
  };

  return (
    <LinearGradient
      colors={BRAND_GRADIENT}
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 24 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 24,
            paddingBottom: 320,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-2 mr-auto flex-row items-center rounded-lg py-2 pr-3"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text className="ml-2 text-base text-white">Back</Text>
          </TouchableOpacity>

          <View className="items-center py-4">
            <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
              <View className="items-center px-6 pt-6 pb-2">
                <Image source={floyieLogo} style={{ width: 112, height: 112 }} contentFit="contain" />
                <Text className="mt-4 text-2xl font-bold text-gray-900">Create Account</Text>
                <Text className="mt-1 text-center text-sm text-gray-500">Join Floyie to start tracking your health</Text>
              </View>
              <View className="px-6 pb-6 pt-4">
                <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} autoCapitalize="words" />
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input label="Password" placeholder="•••••••• (min 6 characters)" value={password} onChangeText={setPassword} secureTextEntry />
                <View className="mb-4">
                  <Text className="mb-1.5 text-sm font-medium text-gray-700">I am a</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <TouchableOpacity
                        key={r.value}
                        onPress={() => setRole(r.value)}
                        activeOpacity={0.8}
                        className={`rounded-lg border px-4 py-2.5 ${role === r.value ? "border-primary bg-primary/10" : "border-gray-200 bg-gray-50"}`}
                      >
                        <Text className={`text-sm font-medium ${role === r.value ? "text-primary" : "text-gray-600"}`}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {error ? <Text className="mb-3 text-sm text-red-500">{error}</Text> : null}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="h-12 w-full items-center justify-center rounded-xl bg-primary"
                  activeOpacity={0.9}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Create Account</Text>}
                </TouchableOpacity>
                <View className="mt-6 flex-row justify-center">
                  <Text className="text-sm text-gray-600">Already have an account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                      <Text className="text-sm font-semibold text-primary">Log in</Text>
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
