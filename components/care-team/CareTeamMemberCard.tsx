import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CareTeamMember } from "@/services/careTeam";

interface CareTeamMemberCardProps {
  member: CareTeamMember;
  onRemove: (member: CareTeamMember) => void;
  removing?: boolean;
}

export function CareTeamMemberCard({
  member,
  onRemove,
  removing,
}: CareTeamMemberCardProps) {
  const isDoctor = member.role === "doctor";
  const iconColor = isDoctor ? "#5b8def" : "#16a34a";
  const bgColor = isDoctor ? "bg-primary/10" : "bg-green-500/10";

  // Format date
  const addedDate = member.addedAt
    ? new Date(member.addedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <View className="flex-row items-center justify-between rounded-xl bg-gray-50 p-3">
      <View className="flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${bgColor}`}
        >
          <Ionicons
            name={isDoctor ? "medical" : "people"}
            size={22}
            color={iconColor}
          />
        </View>
        <View>
          <Text className="font-medium text-gray-900">{member.name}</Text>
          <Text className="text-xs text-gray-500">
            {isDoctor ? "Doctor" : "Caregiver / Family"} • Added {addedDate}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(member)}
        disabled={removing}
        className="rounded-lg p-2"
        activeOpacity={0.7}
      >
        {removing ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        )}
      </TouchableOpacity>
    </View>
  );
}
