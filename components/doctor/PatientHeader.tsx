import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PatientStatus } from "@/services/doctor";

interface PatientHeaderProps {
  name: string;
  status: PatientStatus;
  lastReadingAge?: string;
  onStatusChange?: (status: PatientStatus) => void;
}

// Static class mappings for NativeWind
const statusBgStyles: Record<PatientStatus, string> = {
  stable: "bg-green-100 border-green-200",
  needs_follow_up: "bg-amber-100 border-amber-200",
  priority: "bg-red-100 border-red-200",
};

const statusTextStyles: Record<PatientStatus, string> = {
  stable: "text-green-700",
  needs_follow_up: "text-amber-700",
  priority: "text-red-700",
};

const statusLabels: Record<PatientStatus, string> = {
  stable: "Stable",
  needs_follow_up: "Follow-up",
  priority: "Priority",
};

const statusOptions: PatientStatus[] = ["stable", "needs_follow_up", "priority"];

export function PatientHeader({
  name,
  status,
  lastReadingAge,
  onStatusChange,
}: PatientHeaderProps) {
  return (
    <View className="border-b border-gray-100 px-4 pb-4">
      {/* Patient name and avatar */}
      <View className="flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Text className="text-xl font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">{name}</Text>
          {lastReadingAge && (
            <Text className="text-sm text-gray-500">
              Last reading: {lastReadingAge}
            </Text>
          )}
        </View>
      </View>

      {/* Status selector */}
      <View className="mt-4">
        <Text className="mb-2 text-xs font-medium text-gray-500">
          PATIENT STATUS
        </Text>
        <View className="flex-row gap-2">
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onStatusChange?.(option)}
              className={`flex-1 rounded-lg border px-3 py-2 ${
                status === option
                  ? statusBgStyles[option]
                  : "border-gray-200 bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  status === option ? statusTextStyles[option] : "text-gray-500"
                }`}
              >
                {statusLabels[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
