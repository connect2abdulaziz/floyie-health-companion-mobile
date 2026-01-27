import { Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "secondary";
};

export function Button({ title, variant = "primary", className, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-lg px-4 py-3 ${variant === "primary" ? "bg-blue-600" : "bg-gray-200"} ${className ?? ""}`}
      activeOpacity={0.8}
      {...props}
    >
      <Text
        className={`text-center font-semibold ${variant === "primary" ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
