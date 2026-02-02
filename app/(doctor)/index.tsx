import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { PatientList } from "@/components/doctor";
import { getPatients } from "@/services/doctor";
import { DUMMY_PATIENT } from "@/constants/dummyPatient";

export default function DoctorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({ total: 0, priority: 0, followUp: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;
      setLoadingStats(true);
      const { data } = await getPatients(user.id);
      // Include dummy patient in stats
      const allPatients = [DUMMY_PATIENT, ...(data || [])];
      setStats({
        total: allPatients.length,
        priority: allPatients.filter((p) => p.patient_status === "priority").length,
        followUp: allPatients.filter((p) => p.patient_status === "needs_follow_up").length,
      });
      setLoadingStats(false);
    }
    loadStats();
  }, [user?.id, refreshTrigger]);

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="medical" size={24} color="#5b8def" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-sm text-gray-500">Monitor your patients</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={signOut}
          className="rounded-lg p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {loadingStats ? (
            <ActivityIndicator size="small" color="#5b8def" />
          ) : (
            <Text className="text-2xl font-bold text-gray-900">{stats.total}</Text>
          )}
          <Text className="text-sm text-gray-500">Patients</Text>
        </View>
        <View className="flex-1 rounded-xl border border-red-200 bg-red-50 p-4">
          {loadingStats ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Text className="text-2xl font-bold text-red-600">{stats.priority}</Text>
          )}
          <Text className="text-sm text-gray-500">Priority</Text>
        </View>
        <View className="flex-1 rounded-xl border border-amber-200 bg-amber-50 p-4">
          {loadingStats ? (
            <ActivityIndicator size="small" color="#d97706" />
          ) : (
            <Text className="text-2xl font-bold text-amber-600">{stats.followUp}</Text>
          )}
          <Text className="text-sm text-gray-500">Follow-up</Text>
        </View>
      </View>

      {/* Patient list */}
      <PatientList doctorId={user.id} refreshTrigger={refreshTrigger} />
    </View>
  );
}
