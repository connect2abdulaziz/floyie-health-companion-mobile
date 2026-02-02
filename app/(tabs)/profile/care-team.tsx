import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { CareTeamMemberCard, AddMemberModal } from "@/components/care-team";
import {
  getCareTeam,
  removeCareTeamMember,
  CareTeamMember,
  MemberRole,
} from "@/services/careTeam";

export default function CareTeamScreen() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addRole, setAddRole] = useState<MemberRole>("doctor");

  const loadCareTeam = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await getCareTeam(user.id);
    if (error) {
      console.error("Error loading care team:", error);
    } else {
      setMembers(data || []);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadCareTeam().finally(() => setLoading(false));
  }, [loadCareTeam]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCareTeam();
    setRefreshing(false);
  }, [loadCareTeam]);

  const handleRemove = (member: CareTeamMember) => {
    const roleLabel = member.role === "doctor" ? "doctor" : "caregiver";
    Alert.alert(
      "Remove from Care Team",
      `Are you sure you want to remove ${member.name}? They will no longer have access to your health data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingId(member.id);
            const { success, error } = await removeCareTeamMember(
              member.id,
              member.role
            );
            setRemovingId(null);
            if (success) {
              loadCareTeam();
            } else {
              Alert.alert("Error", error?.message || "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  const openAddModal = (role: MemberRole) => {
    setAddRole(role);
    setShowAddModal(true);
  };

  const doctors = members.filter((m) => m.role === "doctor");
  const caregivers = members.filter((m) => m.role === "caregiver");

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Please sign in to view care team.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-3 text-gray-500">Loading care team...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info box */}
        <View className="mb-6 mt-4 flex-row gap-3 rounded-xl bg-primary/5 p-4">
          <Ionicons
            name="information-circle"
            size={22}
            color="#5b8def"
            style={{ marginTop: 2 }}
          />
          <View className="flex-1">
            <Text className="mb-1 font-medium text-gray-900">How it works</Text>
            <Text className="text-sm leading-5 text-gray-600">
              Add doctors or caregivers to your care team to allow them to view
              your blood pressure readings, trends, and health insights. You
              control who has access to your data.
            </Text>
          </View>
        </View>

        {/* Doctors Section */}
        <View className="mb-6 rounded-xl border border-gray-200 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="medical" size={20} color="#5b8def" />
              <Text className="text-lg font-semibold text-gray-900">Doctors</Text>
            </View>
            <TouchableOpacity
              onPress={() => openAddModal("doctor")}
              className="flex-row items-center gap-1 rounded-lg bg-primary px-3 py-1.5"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text className="text-sm font-medium text-white">Add</Text>
            </TouchableOpacity>
          </View>

          {doctors.length === 0 ? (
            <View className="items-center py-6">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="medical-outline" size={24} color="#9ca3af" />
              </View>
              <Text className="text-center text-sm text-gray-500">
                No doctors added yet.{"\n"}Add a doctor to share your health data.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {doctors.map((doctor) => (
                <CareTeamMemberCard
                  key={doctor.id}
                  member={doctor}
                  onRemove={handleRemove}
                  removing={removingId === doctor.id}
                />
              ))}
            </View>
          )}
        </View>

        {/* Caregivers Section */}
        <View className="mb-6 rounded-xl border border-gray-200 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="people" size={20} color="#16a34a" />
              <Text className="text-lg font-semibold text-gray-900">
                Caregivers / Family
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openAddModal("caregiver")}
              className="flex-row items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text className="text-sm font-medium text-white">Add</Text>
            </TouchableOpacity>
          </View>

          {caregivers.length === 0 ? (
            <View className="items-center py-6">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="people-outline" size={24} color="#9ca3af" />
              </View>
              <Text className="text-center text-sm text-gray-500">
                No caregivers or family added yet.{"\n"}Add someone to share your
                health data.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {caregivers.map((caregiver) => (
                <CareTeamMemberCard
                  key={caregiver.id}
                  member={caregiver}
                  onRemove={handleRemove}
                  removing={removingId === caregiver.id}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        userId={user.id}
        role={addRole}
        onSuccess={loadCareTeam}
      />
    </View>
  );
}
