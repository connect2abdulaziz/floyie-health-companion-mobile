import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerTintColor: "#5b8def",
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile", headerShown: false }} />
      <Stack.Screen name="care-team" options={{ title: "Care Team" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy & Data" }} />
      <Stack.Screen name="legal" options={{ title: "Legal" }} />
    </Stack>
  );
}
