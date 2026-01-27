import { View, Text, TextInput, type TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
      ) : null}
      <TextInput
        className={`rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 ${error ? "border-red-500" : ""} ${className ?? ""}`}
        placeholderTextColor="#9ca3af"
        style={style}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
