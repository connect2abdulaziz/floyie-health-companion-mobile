import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-4 flex-row items-center gap-2"
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#374151" />
        <Text className="text-base font-medium text-gray-700">Back</Text>
      </TouchableOpacity>
      <View className="flex-1 items-center justify-center">
        <Text className="text-center text-xl font-semibold text-gray-900">
          Programs
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          Coming soon. Lifestyle programs here.
        </Text>
      </View>
    </View>
  );
}
