import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "@/components/ui/Card";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name={icon} size={32} color="#9ca3af" />
          </View>
          <Text className="text-center text-lg font-semibold text-gray-900">{title}</Text>
          {description ? (
            <Text className="mt-2 max-w-sm text-center text-sm text-gray-500">
              {description}
            </Text>
          ) : null}
          {action ? (
            <TouchableOpacity
              onPress={action.onPress}
              className="mt-4 rounded-xl bg-primary px-6 py-3"
              activeOpacity={0.9}
            >
              <Text className="font-semibold text-white">{action.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
