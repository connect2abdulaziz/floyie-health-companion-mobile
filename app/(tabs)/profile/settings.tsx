import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "@/components/ui/Card";
import { useContentPadding } from "@/hooks/useContentPadding";

export default function SettingsScreen() {
  const contentPadding = useContentPadding({ stackScreen: true });
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-4 text-base text-gray-500">
        Manage your account and preferences
      </Text>

      {/* Privacy & Data */}
      <Card className="mb-4 border-gray-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => router.push("/profile/privacy")}
            className="flex-row items-center justify-between px-4 py-4"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="shield-checkmark-outline" size={22} color="#5b8def" />
              </View>
              <View>
                <Text className="font-medium text-gray-900">Privacy & Data Controls</Text>
                <Text className="text-sm text-gray-500">AI insights, wearable sync, consent</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card className="mb-4 border-gray-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => router.push("/profile/legal")}
            className="flex-row items-center justify-between px-4 py-4"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Ionicons name="document-text-outline" size={22} color="#d97706" />
              </View>
              <View>
                <Text className="font-medium text-gray-900">Legal Policies</Text>
                <Text className="text-sm text-gray-500">Privacy Policy & Terms of Use</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </CardContent>
      </Card>

      {/* Care Team placeholder */}
      <Card className="mb-4 border-gray-200">
        <CardContent className="p-0">
          <View className="flex-row items-center justify-between px-4 py-4 opacity-80">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="people-outline" size={22} color="#16a34a" />
              </View>
              <View>
                <Text className="font-medium text-gray-900">Care Team</Text>
                <Text className="text-sm text-gray-500">Doctors and caregivers (coming soon)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
