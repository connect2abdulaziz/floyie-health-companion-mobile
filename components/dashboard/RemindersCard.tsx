import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardContent } from "@/components/ui/Card";

type Variant = "reminder" | "success" | "default";

const variantStyles: Record<Variant, string> = {
  reminder: "bg-amber-50 border-amber-200",
  success: "bg-green-50 border-green-200",
  default: "bg-primary/5 border-primary/20",
};

const iconStyles: Record<Variant, string> = {
  reminder: "bg-amber-100",
  success: "bg-green-100",
  default: "bg-primary/10",
};

const iconColors: Record<Variant, string> = {
  reminder: "#d97706",
  success: "#059669",
  default: "#5b8def",
};

type Content = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  variant: Variant;
};

function getContent(morningLogged: boolean, eveningLogged: boolean): Content {
  const hour = new Date().getHours();
  const isMorning = hour < 12;
  const isEvening = hour >= 17;

  if (isMorning && !morningLogged) {
    return {
      icon: "time-outline",
      title: "Morning Reading",
      message: "Start your day right – log your morning blood pressure.",
      variant: "reminder",
    };
  }
  if (isEvening && !eveningLogged) {
    return {
      icon: "time-outline",
      title: "Evening Reading",
      message: "Time to log your evening reading before bed.",
      variant: "reminder",
    };
  }
  if (morningLogged && eveningLogged) {
    return {
      icon: "checkmark-circle",
      title: "You're on track!",
      message: "Great job logging today's readings. Keep it up!",
      variant: "success",
    };
  }
  return {
    icon: "notifications-outline",
    title: "Stay on Track",
    message: "Log your morning and evening readings to keep your Flo Score accurate.",
    variant: "default",
  };
}

interface RemindersCardProps {
  morningLogged?: boolean;
  eveningLogged?: boolean;
}

export function RemindersCard({
  morningLogged = false,
  eveningLogged = false,
}: RemindersCardProps) {
  const content = getContent(morningLogged, eveningLogged);

  return (
    <Card className={`border ${variantStyles[content.variant]}`}>
      <CardContent className="p-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`rounded-full p-2 ${iconStyles[content.variant]}`}
          >
            <Ionicons name={content.icon} size={20} color={iconColors[content.variant]} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-medium text-gray-900">{content.title}</Text>
            <Text className="mt-0.5 text-xs text-gray-500">{content.message}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
