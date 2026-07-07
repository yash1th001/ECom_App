import { Stack } from "expo-router";
import { colors } from "@/theme/colors";
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitle: "",
      }}
    />
  );
}