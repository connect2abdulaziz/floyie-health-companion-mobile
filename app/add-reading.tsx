import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContentPadding } from "@/hooks/useContentPadding";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { validateReading } from "@/lib/validateReading";
import { Input } from "@/components/ui/Input";

export default function AddReadingScreen() {
  const contentPadding = useContentPadding();
  const router = useRouter();
  const { user } = useAuth();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const hr = parseInt(heartRate, 10);

    if (Number.isNaN(sys) || Number.isNaN(dia) || Number.isNaN(hr)) {
      setError("Please enter valid numbers for systolic, diastolic, and heart rate.");
      return;
    }

    const validationError = validateReading(sys, dia, hr);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError("You must be signed in to add a reading.");
      return;
    }

    setLoading(true);
    const { error: dbError } = await supabase.from("readings").insert({
      user_id: user.id,
      systolic: sys,
      diastolic: dia,
      heart_rate: hr,
      notes: notes.trim() || null,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
    if (dbError) {
      setError(dbError.message ?? "Failed to save reading.");
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={contentPadding}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center gap-2"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="text-base font-medium text-gray-700">Back</Text>
        </TouchableOpacity>

        <Text className="mb-1 text-2xl font-bold text-gray-900">
          Add Blood Pressure Reading
        </Text>
        <Text className="mb-6 text-sm text-gray-500">
          Record your current blood pressure and heart rate
        </Text>

        <View className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Text className="text-sm text-gray-600">
            Tip: For best results, take readings when you're calm, seated, and
            rested for at least 5 minutes.
          </Text>
        </View>

        <Input
          label="Systolic (mmHg)"
          placeholder="120"
          value={systolic}
          onChangeText={setSystolic}
          keyboardType="number-pad"
        />
        <Input
          label="Diastolic (mmHg)"
          placeholder="80"
          value={diastolic}
          onChangeText={setDiastolic}
          keyboardType="number-pad"
        />
        <Input
          label="Heart Rate (bpm)"
          placeholder="70"
          value={heartRate}
          onChangeText={setHeartRate}
          keyboardType="number-pad"
        />
        <Input
          label="Notes (optional)"
          placeholder="Any observations or symptoms..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {error ? (
          <Text className="mb-3 text-sm text-red-500">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="mt-2 rounded-xl bg-primary py-3.5"
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-semibold text-white">
              Save Reading
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
