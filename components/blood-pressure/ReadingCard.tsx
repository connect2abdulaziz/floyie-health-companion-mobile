import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { classifyBP, type BPCategory } from "@/lib/bpZones";
import type { Reading } from "@/services/readings";

interface ReadingCardProps {
  reading: Reading;
  onDelete?: (id: string) => void;
}

// Static class mappings for NativeWind (must be full strings, not interpolated)
const cardBgStyles: Record<BPCategory, string> = {
  normal: "bg-green-100 border-green-300",
  elevated: "bg-yellow-100 border-yellow-300",
  stage1: "bg-amber-100 border-amber-300",
  stage2: "bg-orange-100 border-orange-300",
  crisis: "bg-red-100 border-red-300",
};

const badgeStyles: Record<BPCategory, string> = {
  normal: "bg-green-100 border-green-300",
  elevated: "bg-yellow-100 border-yellow-300",
  stage1: "bg-amber-100 border-amber-300",
  stage2: "bg-orange-100 border-orange-300",
  crisis: "bg-red-100 border-red-300",
};

const textStyles: Record<BPCategory, string> = {
  normal: "text-green-700",
  elevated: "text-yellow-700",
  stage1: "text-amber-700",
  stage2: "text-orange-700",
  crisis: "text-red-700",
};

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReadingCard({ reading, onDelete }: ReadingCardProps) {
  const classification = classifyBP(reading.systolic, reading.diastolic);
  const category = classification.category;

  return (
    <View className={`rounded-xl border p-4 ${cardBgStyles[category]}`}>
      {/* Header row: BP values + zone badge */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-2xl font-bold text-gray-900">
            {reading.systolic}/{reading.diastolic}
          </Text>
          <Text className="text-sm text-gray-500">mmHg</Text>
        </View>
        <View className={`rounded-full border px-2.5 py-1 ${badgeStyles[category]}`}>
          <Text className={`text-xs font-medium ${textStyles[category]}`}>
            {classification.label}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View className="mb-2 flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="heart" size={16} color="#ef4444" />
          <Text className="text-sm text-gray-700">{reading.heart_rate} bpm</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-500">{formatDate(reading.timestamp)}</Text>
        </View>
      </View>

      {/* Notes */}
      {reading.notes ? (
        <View className="mt-2 rounded-lg bg-white/50 p-2">
          <Text className="text-sm italic text-gray-600">{reading.notes}</Text>
        </View>
      ) : null}

      {/* Delete button (optional) */}
      {onDelete ? (
        <TouchableOpacity
          onPress={() => onDelete(reading.id)}
          className="absolute right-3 top-3 p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
