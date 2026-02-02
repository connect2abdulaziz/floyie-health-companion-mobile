import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  PatientHeader,
  MetricsCard,
  ClinicalSummary,
} from "@/components/doctor";
import {
  getPatientProfile,
  calculatePatientMetrics,
  getPatientReadings,
  updatePatientStatus,
  getDoctorNotes,
  PatientMetrics,
  PatientProfile,
  PatientStatus,
} from "@/services/doctor";
import { classifyBP } from "@/lib/bpZones";
import {
  DUMMY_PATIENT_ID,
  DUMMY_PATIENT_PROFILE,
  DUMMY_PATIENT_METRICS,
  DUMMY_PATIENT_READINGS,
} from "@/constants/dummyPatient";

export default function PatientDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [metrics, setMetrics] = useState<PatientMetrics | null>(null);
  const [status, setStatus] = useState<PatientStatus>("stable");
  const [readings, setReadings] = useState<
    Array<{
      id: string;
      systolic: number;
      diastolic: number;
      heart_rate: number;
      timestamp: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = useCallback(async () => {
    if (!id || !user?.id) return;

    // Handle dummy patient with static data
    if (id === DUMMY_PATIENT_ID) {
      setProfile(DUMMY_PATIENT_PROFILE);
      setMetrics(DUMMY_PATIENT_METRICS);
      setReadings(DUMMY_PATIENT_READINGS);
      setStatus("needs_follow_up");
      return;
    }

    // Load real patient data
    const [profileRes, metricsRes, readingsRes, notesRes] = await Promise.all([
      getPatientProfile(id),
      calculatePatientMetrics(id),
      getPatientReadings(id, 7),
      getDoctorNotes(user.id, id),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    setMetrics(metricsRes);
    if (readingsRes.data) setReadings(readingsRes.data);
    if (notesRes.data) setStatus(notesRes.data.patient_status);
  }, [id, user?.id]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshTrigger((t) => t + 1);
    setRefreshing(false);
  }, [loadData]);

  const handleStatusChange = async (newStatus: PatientStatus) => {
    if (!user?.id || !id) return;
    setStatus(newStatus);
    // Don't call API for dummy patient
    if (id !== DUMMY_PATIENT_ID) {
      await updatePatientStatus(user.id, id, newStatus);
    }
  };

  // Calculate last reading age
  let lastReadingAge: string | undefined;
  if (metrics?.lastReadingAge) {
    lastReadingAge = metrics.lastReadingAge;
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-3 text-gray-500">Loading patient data...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Top bar */}
      <View className="flex-row items-center gap-3 bg-white px-4 pb-3 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-lg p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Patient Details
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Patient Header */}
        <View className="bg-white">
          <PatientHeader
            name={profile?.name || "Unknown"}
            status={status}
            lastReadingAge={lastReadingAge}
            onStatusChange={handleStatusChange}
          />
        </View>

        {/* Content */}
        <View className="gap-4 p-4">
          {/* Clinical Summary */}
          {id && <ClinicalSummary patientId={id} refreshTrigger={refreshTrigger} />}

          {/* Metrics */}
          <MetricsCard metrics={metrics} />

          {/* Recent Readings */}
          <View className="rounded-xl border border-gray-200 bg-white p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="list-outline" size={20} color="#374151" />
              <Text className="font-semibold text-gray-900">
                Recent Readings
              </Text>
              <Text className="text-sm text-gray-400">
                ({readings.length})
              </Text>
            </View>

            {readings.length === 0 ? (
              <Text className="py-4 text-center text-sm text-gray-500">
                No readings in the past 7 days
              </Text>
            ) : (
              <View className="gap-2">
                {readings.slice(0, 5).map((reading) => {
                  const classification = classifyBP(
                    reading.systolic,
                    reading.diastolic
                  );
                  const date = new Date(reading.timestamp);
                  const timeStr = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const dateStr = date.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <View
                      key={reading.id}
                      className="flex-row items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <View>
                        <Text className="text-base font-semibold text-gray-900">
                          {reading.systolic}/{reading.diastolic}
                          <Text className="text-sm font-normal text-gray-400">
                            {" "}mmHg
                          </Text>
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {classification.label}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-gray-600">{dateStr}</Text>
                        <Text className="text-xs text-gray-400">{timeStr}</Text>
                      </View>
                    </View>
                  );
                })}
                {readings.length > 5 && (
                  <Text className="mt-2 text-center text-xs text-gray-400">
                    + {readings.length - 5} more readings
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
