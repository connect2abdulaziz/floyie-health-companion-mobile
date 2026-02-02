import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { validateReading } from "@/lib/validateReading";
import { addReading, type NewReading } from "@/services/readings";

interface ReadingFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function ReadingForm({ userId, onSuccess }: ReadingFormProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const hr = parseInt(heartRate, 10);

    if (Number.isNaN(sys) || Number.isNaN(dia) || Number.isNaN(hr)) {
      setError("Please enter valid numbers for all fields.");
      return;
    }

    const validationError = validateReading(sys, dia, hr);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const newReading: NewReading = {
      user_id: userId,
      systolic: sys,
      diastolic: dia,
      heart_rate: hr,
      notes: notes.trim() || null,
      timestamp: new Date().toISOString(),
    };

    const { error: dbError } = await addReading(newReading);

    setLoading(false);

    if (dbError) {
      setError(dbError.message ?? "Failed to save reading.");
      return;
    }

    resetForm();
    onSuccess?.();
  };

  return (
    <View>
      {/* Tip card */}
      <View className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <View className="flex-row items-start gap-2">
          <Ionicons name="bulb-outline" size={18} color="#5b8def" />
          <Text className="flex-1 text-sm text-gray-600">
            For best results, take readings when you're calm, seated, and rested
            for at least 5 minutes.
          </Text>
        </View>
      </View>

      {/* Form inputs */}
      <View className="mb-2 flex-row gap-3">
        <View className="flex-1">
          <Input
            label="Systolic"
            placeholder="120"
            value={systolic}
            onChangeText={setSystolic}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Diastolic"
            placeholder="80"
            value={diastolic}
            onChangeText={setDiastolic}
            keyboardType="number-pad"
          />
        </View>
      </View>

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
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: "top" }}
      />

      {/* Error message */}
      {error ? (
        <View className="mb-3 flex-row items-center gap-2 rounded-lg bg-red-50 p-3">
          <Ionicons name="alert-circle" size={18} color="#dc2626" />
          <Text className="flex-1 text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      {/* Submit button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="rounded-xl bg-primary py-3.5"
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text className="font-semibold text-white">Save Reading</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
