import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Patient, PatientStatus } from "@/services/doctor";
import { classifyBP } from "@/lib/bpZones";

interface PatientCardProps {
  patient: Patient;
}

// Static class mappings for NativeWind (must be full strings, not interpolated)
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

const statusIconColors: Record<PatientStatus, string> = {
  stable: "#15803d",
  needs_follow_up: "#b45309",
  priority: "#dc2626",
};

export function PatientCard({ patient }: PatientCardProps) {
  const router = useRouter();
  const status = patient.patient_status;

  // Format last reading info
  let lastReadingText = "No readings yet";
  let bpLabel = "";
  let bpColor = "text-gray-500";

  if (patient.lastReading) {
    const { systolic, diastolic } = patient.lastReading;
    const classification = classifyBP(systolic, diastolic);
    lastReadingText = `${systolic}/${diastolic} mmHg`;
    bpLabel = classification.label;

    // Map BP category to text color
    if (classification.category === "normal") {
      bpColor = "text-green-600";
    } else if (classification.category === "elevated") {
      bpColor = "text-yellow-600";
    } else if (classification.category === "stage1") {
      bpColor = "text-amber-600";
    } else if (classification.category === "stage2") {
      bpColor = "text-orange-600";
    } else if (classification.category === "crisis") {
      bpColor = "text-red-600";
    }
  }

  // Format time ago
  let timeAgo = "";
  if (patient.lastReading?.timestamp) {
    const readingDate = new Date(patient.lastReading.timestamp);
    const now = new Date();
    const hoursAgo = Math.floor(
      (now.getTime() - readingDate.getTime()) / (1000 * 60 * 60)
    );
    if (hoursAgo < 1) {
      timeAgo = "Just now";
    } else if (hoursAgo < 24) {
      timeAgo = `${hoursAgo}h ago`;
    } else {
      timeAgo = `${Math.floor(hoursAgo / 24)}d ago`;
    }
  }

  const handlePress = () => {
    router.push(`/(doctor)/patient/${patient.user_id}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
    >
      <View className="flex-row items-start justify-between">
        {/* Left: Patient info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-900">
              {patient.name}
            </Text>
            <View
              className={`rounded-full border px-2 py-0.5 ${statusBgStyles[status]}`}
            >
              <Text className={`text-xs font-medium ${statusTextStyles[status]}`}>
                {statusLabels[status]}
              </Text>
            </View>
          </View>

          {/* Last reading */}
          <View className="mt-2">
            {patient.lastReading ? (
              <>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="heart" size={14} color={statusIconColors[status]} />
                  <Text className={`text-sm font-medium ${bpColor}`}>
                    {lastReadingText}
                  </Text>
                  <Text className="text-xs text-gray-400">• {timeAgo}</Text>
                </View>
                <Text className="mt-0.5 text-xs text-gray-500">{bpLabel}</Text>
              </>
            ) : (
              <Text className="text-sm text-gray-400">{lastReadingText}</Text>
            )}
          </View>
        </View>

        {/* Right: Arrow */}
        <View className="ml-3 justify-center">
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
