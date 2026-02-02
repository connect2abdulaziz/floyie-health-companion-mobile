import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useContentPadding } from "@/hooks/useContentPadding";
import { ReadingForm } from "@/components/blood-pressure/ReadingForm";
import { ReadingsList } from "@/components/blood-pressure/ReadingsList";

type Tab = "add" | "logs";

// Static class strings for NativeWind (avoids dynamic className issues)
const TAB_BASE = "flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2.5";
const TAB_ACTIVE = "flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2.5 bg-white shadow-sm";
const TAB_TEXT_ACTIVE = "font-medium text-primary";
const TAB_TEXT_INACTIVE = "font-medium text-gray-500";

export default function BloodPressureScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReadingSaved = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("logs");
  }, []);

  // Not authenticated
  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Ionicons name="lock-closed-outline" size={48} color="#9ca3af" />
        <Text className="mt-4 text-center text-base text-gray-600">
          Please sign in to track your blood pressure.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={contentPadding}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="heart" size={28} color="#5b8def" />
          <Text className="text-2xl font-bold text-gray-900">Blood Pressure</Text>
        </View>
        <Text className="mb-6 text-base text-gray-500">
          Track and monitor your readings
        </Text>

        {/* Tab switcher */}
        <View className="mb-4 flex-row rounded-xl bg-gray-100 p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("add")}
            className={activeTab === "add" ? TAB_ACTIVE : TAB_BASE}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={activeTab === "add" ? "#5b8def" : "#6b7280"}
            />
            <Text className={activeTab === "add" ? TAB_TEXT_ACTIVE : TAB_TEXT_INACTIVE}>
              Add Reading
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => setActiveTab("logs")}
            className={activeTab === "logs" ? TAB_ACTIVE : TAB_BASE}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={activeTab === "logs" ? "#5b8def" : "#6b7280"}
            />
            <Text className={activeTab === "logs" ? TAB_TEXT_ACTIVE : TAB_TEXT_INACTIVE}>
              Weekly Logs
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Tab content */}
        {activeTab === "add" ? (
          <ReadingForm userId={user.id} onSuccess={handleReadingSaved} />
        ) : (
          <ReadingsList userId={user.id} refreshTrigger={refreshTrigger} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
