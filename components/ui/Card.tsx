import { View, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-gray-200 bg-white ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <View className={`px-4 pt-4 pb-2 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <View className={`px-4 pb-4 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className, ...props }: CardProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}
