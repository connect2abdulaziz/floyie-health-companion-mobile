import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generateClinicalSummary } from "@/services/doctor";
import { DUMMY_PATIENT_ID, DUMMY_CLINICAL_SUMMARY } from "@/constants/dummyPatient";

interface ClinicalSummaryProps {
  patientId: string;
  refreshTrigger?: number;
}

export function ClinicalSummary({ patientId, refreshTrigger = 0 }: ClinicalSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      
      // Use static summary for dummy patient
      if (patientId === DUMMY_PATIENT_ID) {
        setSummary(DUMMY_CLINICAL_SUMMARY);
        setLoading(false);
        return;
      }
      
      const text = await generateClinicalSummary(patientId);
      setSummary(text);
      setLoading(false);
    }
    loadSummary();
  }, [patientId, refreshTrigger]);

  return (
    <View className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <Ionicons name="sparkles" size={16} color="#5b8def" />
        </View>
        <View>
          <Text className="font-semibold text-gray-900">Flo Summary</Text>
          <Text className="text-xs text-gray-500">AI-generated insights</Text>
        </View>
      </View>

      <View className="mt-3">
        {loading ? (
          <View className="flex-row items-center gap-2 py-2">
            <ActivityIndicator size="small" color="#5b8def" />
            <Text className="text-sm text-gray-500">Generating summary...</Text>
          </View>
        ) : (
          <Text className="text-sm leading-5 text-gray-700">{summary}</Text>
        )}
      </View>
    </View>
  );
}
