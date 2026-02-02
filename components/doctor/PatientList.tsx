import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPatients, Patient, PatientStatus } from "@/services/doctor";
import { PatientCard } from "./PatientCard";
import { DUMMY_PATIENT } from "@/constants/dummyPatient";

interface PatientListProps {
  doctorId: string;
  refreshTrigger?: number;
}

type FilterType = "all" | PatientStatus;

// Static class mappings for NativeWind
const FILTER_BASE = "rounded-full border border-gray-200 bg-white px-3 py-1.5";
const FILTER_ACTIVE = "rounded-full border border-primary bg-primary px-3 py-1.5";
const FILTER_TEXT_ACTIVE = "text-xs font-medium text-white";
const FILTER_TEXT_INACTIVE = "text-xs font-medium text-gray-600";

export function PatientList({ doctorId, refreshTrigger = 0 }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchPatients = useCallback(async () => {
    const { data, error: fetchError } = await getPatients(doctorId);
    if (fetchError) {
      setError(fetchError.message);
      // Still show dummy patient even on error
      setPatients([DUMMY_PATIENT]);
    } else {
      // Include dummy patient along with real patients
      setPatients([DUMMY_PATIENT, ...(data || [])]);
      setError("");
    }
  }, [doctorId]);

  useEffect(() => {
    setLoading(true);
    fetchPatients().finally(() => setLoading(false));
  }, [fetchPatients, refreshTrigger]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, [fetchPatients]);

  // Filter and search
  const filteredPatients = patients.filter((patient) => {
    // Filter by status
    if (filter !== "all" && patient.patient_status !== filter) {
      return false;
    }
    // Search by name
    if (searchQuery.trim()) {
      return patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Sort: priority first, then needs_follow_up, then stable
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const order: Record<PatientStatus, number> = {
      priority: 0,
      needs_follow_up: 1,
      stable: 2,
    };
    return order[a.patient_status] - order[b.patient_status];
  });

  // Count by status
  const statusCounts = {
    all: patients.length,
    priority: patients.filter((p) => p.patient_status === "priority").length,
    needs_follow_up: patients.filter((p) => p.patient_status === "needs_follow_up").length,
    stable: patients.filter((p) => p.patient_status === "stable").length,
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-3 text-gray-500">Loading patients...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-3 text-red-600">{error}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="mt-4 rounded-lg bg-primary px-4 py-2"
        >
          <Text className="font-medium text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search bar */}
      <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search patients..."
          placeholderTextColor="#9ca3af"
          className="ml-2 flex-1 text-base text-gray-900"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        <TouchableOpacity
          onPress={() => setFilter("all")}
          className={filter === "all" ? FILTER_ACTIVE : FILTER_BASE}
          activeOpacity={0.7}
        >
          <Text className={filter === "all" ? FILTER_TEXT_ACTIVE : FILTER_TEXT_INACTIVE}>
            All ({statusCounts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("priority")}
          className={filter === "priority" ? FILTER_ACTIVE : FILTER_BASE}
          activeOpacity={0.7}
        >
          <Text className={filter === "priority" ? FILTER_TEXT_ACTIVE : FILTER_TEXT_INACTIVE}>
            Priority ({statusCounts.priority})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("needs_follow_up")}
          className={filter === "needs_follow_up" ? FILTER_ACTIVE : FILTER_BASE}
          activeOpacity={0.7}
        >
          <Text className={filter === "needs_follow_up" ? FILTER_TEXT_ACTIVE : FILTER_TEXT_INACTIVE}>
            Follow-up ({statusCounts.needs_follow_up})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("stable")}
          className={filter === "stable" ? FILTER_ACTIVE : FILTER_BASE}
          activeOpacity={0.7}
        >
          <Text className={filter === "stable" ? FILTER_TEXT_ACTIVE : FILTER_TEXT_INACTIVE}>
            Stable ({statusCounts.stable})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patient list */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedPatients.length === 0 ? (
          <View className="items-center py-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="people-outline" size={32} color="#9ca3af" />
            </View>
            <Text className="text-base font-medium text-gray-900">No patients found</Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filter"
                : "Add patients to start monitoring"}
            </Text>
          </View>
        ) : (
          <View>
            {sortedPatients.map((patient) => (
              <PatientCard key={patient.user_id} patient={patient} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
