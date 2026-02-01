import { Stack } from "expo-router";

export default function InsightsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerTintColor: "#5b8def",
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Health Insights", headerShown: false }} />
      <Stack.Screen name="wearables" options={{ title: "Wearable Metrics" }} />
      <Stack.Screen name="flo-history" options={{ title: "Flo AI History" }} />
    </Stack>
  );
}
