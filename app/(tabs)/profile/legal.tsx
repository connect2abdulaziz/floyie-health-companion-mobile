import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "@/components/ui/Card";
import { useContentPadding } from "@/hooks/useContentPadding";

// Replace with your actual policy URLs when available
const PRIVACY_POLICY_URL = "https://floyie.com/privacy";
const TERMS_URL = "https://floyie.com/terms";

export default function LegalScreen() {
  const contentPadding = useContentPadding({ stackScreen: true });

  const openUrl = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-4 text-base text-gray-500">
        Read our policies and terms
      </Text>

      <Card className="mb-4 border-gray-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => openUrl(PRIVACY_POLICY_URL)}
            className="flex-row items-center justify-between px-4 py-4"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="shield-checkmark-outline" size={22} color="#5b8def" />
              </View>
              <Text className="font-medium text-gray-900">Privacy Policy</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </CardContent>
      </Card>

      <Card className="mb-4 border-gray-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => openUrl(TERMS_URL)}
            className="flex-row items-center justify-between px-4 py-4"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Ionicons name="document-text-outline" size={22} color="#d97706" />
              </View>
              <Text className="font-medium text-gray-900">Terms of Use</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="py-3 px-4">
          <Text className="text-center text-xs text-gray-500">
            Links open in your browser. Update the URLs in the app if your policies live elsewhere.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
