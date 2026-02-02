import { Stack } from "expo-router";

export default function DoctorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Doctor Dashboard" }} />
      <Stack.Screen
        name="patient/[id]"
        options={{
          title: "Patient Detail",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
