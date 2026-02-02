import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReadingCard } from "./ReadingCard";
import { getReadings, deleteReading, type Reading } from "@/services/readings";

interface ReadingsListProps {
  userId: string;
  refreshTrigger?: number;
}

export function ReadingsList({ userId, refreshTrigger }: ReadingsListProps) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = useCallback(async () => {
    if (!userId) return;

    setError(null);
    setLoading(true);
    const { data, error: fetchError } = await getReadings(userId, { days: 7 });

    if (fetchError) {
      setError("Failed to load readings. Tap to retry.");
    } else {
      setReadings(data ?? []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings, refreshTrigger]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      "Delete Reading",
      "Are you sure you want to delete this reading?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await deleteReading(id);
            if (deleteError) {
              Alert.alert("Error", "Failed to delete reading.");
            } else {
              setReadings((prev) => prev.filter((r) => r.id !== id));
            }
          },
        },
      ]
    );
  }, []);

  // Loading state
  if (loading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-3 text-sm text-gray-500">Loading readings...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <TouchableOpacity
        onPress={fetchReadings}
        className="items-center justify-center py-12"
        activeOpacity={0.8}
      >
        <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
        <Text className="mt-3 text-center text-gray-500">{error}</Text>
      </TouchableOpacity>
    );
  }

  // Empty state
  if (readings.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Ionicons name="clipboard-outline" size={48} color="#9ca3af" />
        <Text className="mt-3 text-base font-medium text-gray-700">
          No readings this week
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Add your first reading to start tracking
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="mb-4 text-sm text-gray-500">
        Showing {readings.length} reading{readings.length !== 1 ? "s" : ""} from
        the past 7 days
      </Text>
      {/* <View className="gap-3">
        {readings.map((reading) => (
          <ReadingCard
            key={reading.id}
            reading={reading}
            onDelete={handleDelete}
          />
        ))}
      </View> */}
    </View>
  );
}
