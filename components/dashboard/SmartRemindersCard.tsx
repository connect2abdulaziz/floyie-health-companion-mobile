import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { getSmartReminders, type SmartReminder } from "@/services/smartReminders";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";

export function SmartRemindersCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      getSmartReminders(user.id).then(setReminders).finally(() => setLoading(false));
    }
  }, [user]);

  const visible = reminders.filter((r) => !dismissed.has(r.id));

  if (loading) return null;

  if (visible.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="flex-row items-center gap-2">
        <Ionicons name="notifications-outline" size={20} color="#374151" />
        <Text className="font-semibold text-gray-900">Smart Reminders</Text>
      </CardHeader>
      <CardContent className="pt-0">
        <View className="gap-3">
          {visible.map((r) => (
            <View
              key={r.id}
              className="flex-row items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <Ionicons name="time-outline" size={20} color="#d97706" />
              <View className="flex-1 min-w-0">
                <Text className="font-medium text-gray-900">{r.title}</Text>
                <Text className="mt-0.5 text-sm text-gray-600">{r.message}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDismissed((s) => new Set([...s, r.id]))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {visible.some((r) => r.type === "reading") && (
          <TouchableOpacity
            onPress={() => router.push("/add-reading")}
            className="mt-3 rounded-lg bg-primary py-2.5"
            activeOpacity={0.9}
          >
            <Text className="text-center font-semibold text-white">
              Add Reading
            </Text>
          </TouchableOpacity>
        )}
      </CardContent>
    </Card>
  );
}
