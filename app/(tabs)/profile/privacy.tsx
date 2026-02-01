import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useContentPadding } from "@/hooks/useContentPadding";
import { getUserConsent, updatePreference } from "@/services/consent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding({ stackScreen: true });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [wearableSync, setWearableSync] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const consent = await getUserConsent(user.id);
    if (consent?.metadata) {
      setAiInsights(consent.metadata.ai_insights !== false);
      setWearableSync(consent.metadata.wearable_sync !== false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleAiInsights = async (value: boolean) => {
    if (!user) return;
    setAiInsights(value);
    const { success } = await updatePreference(user.id, "ai_insights", value);
    if (!success) {
      setAiInsights(!value);
      Alert.alert("Error", "Could not update preference. Try again.");
    }
  };

  const handleWearableSync = async (value: boolean) => {
    if (!user) return;
    setWearableSync(value);
    const { success } = await updatePreference(user.id, "wearable_sync", value);
    if (!success) {
      setWearableSync(!value);
      Alert.alert("Error", "Could not update preference. Try again.");
    }
  };

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-600">Sign in to manage privacy.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-4 text-base text-gray-500">Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={contentPadding}
      showsVerticalScrollIndicator={false}
    >
      <Text className="mb-4 text-base text-gray-500">
        Control which features use your data
      </Text>

      <Card className="mb-4 border-gray-200">
        <CardHeader>
          <CardTitle>
            <Text className="text-lg font-semibold text-gray-900">Feature preferences</Text>
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="bulb-outline" size={22} color="#5b8def" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">AI insights</Text>
                <Text className="text-sm text-gray-500">
                  Let Flo analyze patterns and suggest tips
                </Text>
              </View>
            </View>
            <Switch
              value={aiInsights}
              onValueChange={handleAiInsights}
              trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
              thumbColor={aiInsights ? "#5b8def" : "#9ca3af"}
            />
          </View>
          <View className="h-px bg-gray-200" />
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="watch-outline" size={22} color="#5b8def" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Wearable sync</Text>
                <Text className="text-sm text-gray-500">
                  Sync data from connected devices
                </Text>
              </View>
            </View>
            <Switch
              value={wearableSync}
              onValueChange={handleWearableSync}
              trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
              thumbColor={wearableSync ? "#5b8def" : "#9ca3af"}
            />
          </View>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="py-3 px-4">
          <Text className="text-center text-xs text-gray-500">
            Your choices only affect how Floyie uses your data. You can change these anytime.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
