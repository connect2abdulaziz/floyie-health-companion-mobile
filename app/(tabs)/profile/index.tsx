import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Share } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useContentPadding } from "@/hooks/useContentPadding";
import { getProfile, updateProfile } from "@/services/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const contentPadding = useContentPadding();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const profile = await getProfile(user.id);
    if (profile) {
      setName(profile.name ?? "");
    } else {
      setName((user.user_metadata?.name as string) ?? "");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleSave = async () => {
    if (!user || !dirty) return;
    setSaving(true);
    const { success } = await updateProfile(user.id, { name: name.trim() || undefined });
    setSaving(false);
    if (success) {
      setDirty(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/welcome");
        },
      },
    ]);
  };

  const sharePatientId = () => {
    if (user?.id) {
      Share.share({
        message: user.id,
        title: "Patient ID",
      }).catch(() => {});
    }
  };

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-center text-base text-gray-600">Sign in to view profile.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#5b8def" />
        <Text className="mt-4 text-base text-gray-500">Loading profile…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={contentPadding}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person" size={28} color="#5b8def" />
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center gap-2 rounded-lg px-3 py-2"
            activeOpacity={0.9}
          >
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            <Text className="text-sm font-medium text-red-600">Sign out</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-6 text-base text-gray-500">Manage your account</Text>

        {/* Account / Personal info */}
        <Card className="mb-4 border-gray-200">
          <CardHeader>
            <CardTitle>
              <Text className="text-lg font-semibold text-gray-900">Account</Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-0">
            <Input
              label="Name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setDirty(true);
              }}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Email</Text>
              <Text className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-600">
                {user.email ?? "—"}
              </Text>
            </View>
            {dirty && (
              <Button
                title={saving ? "Saving…" : "Save name"}
                onPress={handleSave}
                disabled={saving}
                className="bg-primary"
              />
            )}
          </CardContent>
        </Card>

        {/* Patient ID */}
        <Card className="mb-4 border-gray-200">
          <CardHeader>
            <CardTitle>
              <Text className="text-lg font-semibold text-gray-900">Patient ID</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="mb-2 text-xs text-gray-500">
              Share with your doctor or caregiver so they can access your data in Floyie.
            </Text>
            <TouchableOpacity
              onPress={sharePatientId}
              className="flex-row items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              activeOpacity={0.9}
            >
              <Text className="flex-1 font-mono text-xs text-gray-700" numberOfLines={1}>
                {user.id}
              </Text>
              <Ionicons name="share-outline" size={18} color="#5b8def" />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4 border-gray-200">
          <CardContent className="p-0">
            <TouchableOpacity
              onPress={() => router.push("/profile/settings")}
              className="flex-row items-center justify-between px-4 py-4"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons name="settings-outline" size={22} color="#5b8def" />
                </View>
                <View>
                  <Text className="font-medium text-gray-900">Settings</Text>
                  <Text className="text-sm text-gray-500">Privacy, legal, and preferences</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Quick links */}
        <View className="mb-4 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/insights/wearables")}
            className="flex-1"
            activeOpacity={0.9}
          >
            <Card className="border-gray-200">
              <CardContent className="flex-row items-center gap-3 py-4">
                <View className="rounded-xl bg-primary/10 p-2">
                  <Ionicons name="watch-outline" size={22} color="#5b8def" />
                </View>
                <Text className="font-medium text-gray-900">Wearable Metrics</Text>
              </CardContent>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/insights/flo-history")}
            className="flex-1"
            activeOpacity={0.9}
          >
            <Card className="border-gray-200">
              <CardContent className="flex-row items-center gap-3 py-4">
                <View className="rounded-xl bg-primary/10 p-2">
                  <Ionicons name="sparkles" size={22} color="#5b8def" />
                </View>
                <Text className="font-medium text-gray-900">Flo AI History</Text>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Sign out (bottom) */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3"
          activeOpacity={0.9}
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text className="font-semibold text-red-600">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
