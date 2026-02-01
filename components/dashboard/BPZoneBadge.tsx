import { View, Text } from "react-native";
import { classifyBP } from "@/lib/bpZones";

interface BPZoneBadgeProps {
  systolic: number;
  diastolic: number;
  size?: "sm" | "md";
}

export function BPZoneBadge({ systolic, diastolic, size = "md" }: BPZoneBadgeProps) {
  const c = classifyBP(systolic, diastolic);
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <View className={`rounded-full border ${c.bgColor} ${c.borderColor} ${padding}`}>
      <Text className={`font-medium ${textSize} ${c.color}`}>{c.label}</Text>
    </View>
  );
}
