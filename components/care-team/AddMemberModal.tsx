import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MemberRole, addCareTeamMember } from "@/services/careTeam";

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  role: MemberRole;
  onSuccess: () => void;
}

export function AddMemberModal({
  visible,
  onClose,
  userId,
  role,
  onSuccess,
}: AddMemberModalProps) {
  const [memberId, setMemberId] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const isDoctor = role === "doctor";
  const roleLabel = isDoctor ? "Doctor" : "Caregiver / Family";

  const handleAdd = async () => {
    if (!memberId.trim()) return;

    setError("");
    setAdding(true);

    const result = await addCareTeamMember(userId, memberId.trim(), role);

    setAdding(false);

    if (result.success) {
      setMemberId("");
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to add member");
    }
  };

  const handleClose = () => {
    setMemberId("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="rounded-t-3xl bg-white px-6 pb-10 pt-6">
              {/* Handle bar */}
              <View className="mb-4 self-center">
                <View className="h-1 w-10 rounded-full bg-gray-300" />
              </View>

              {/* Header */}
              <View className="mb-4 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons name="person-add" size={20} color="#5b8def" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Add {roleLabel}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Enter their unique ID
                  </Text>
                </View>
              </View>

              {/* Info box */}
              <View className="mb-4 flex-row gap-3 rounded-xl bg-amber-50 p-3">
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#d97706"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-medium text-gray-900">
                    How to find their ID
                  </Text>
                  <Text className="text-xs leading-4 text-gray-600">
                    Ask your {roleLabel.toLowerCase()} to go to their{" "}
                    <Text className="font-semibold">Profile</Text> page in Floyie
                    and share their unique ID with you.
                  </Text>
                </View>
              </View>

              {/* Input */}
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-medium text-gray-700">
                  {roleLabel} ID
                </Text>
                <TextInput
                  value={memberId}
                  onChangeText={(text) => {
                    setMemberId(text);
                    setError("");
                  }}
                  placeholder="Enter their ID (UUID)..."
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                />
                {error ? (
                  <Text className="mt-2 text-sm text-red-600">{error}</Text>
                ) : null}
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 rounded-xl border border-gray-200 py-3"
                  activeOpacity={0.7}
                >
                  <Text className="text-center font-medium text-gray-700">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={adding || !memberId.trim()}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                    !memberId.trim() ? "bg-primary/50" : "bg-primary"
                  }`}
                  activeOpacity={0.7}
                >
                  {adding ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="person-add" size={18} color="#ffffff" />
                  )}
                  <Text className="font-medium text-white">
                    {adding ? "Adding..." : `Add ${roleLabel}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
