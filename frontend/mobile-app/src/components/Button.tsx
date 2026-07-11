import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { T } from "./Text";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = "primary", disabled, loading, style }: Props) {
  const bg = variant === "primary" ? colors.gold : variant === "secondary" ? colors.surface : "transparent";
  const fg = variant === "primary" ? colors.surface : colors.ink;
  const border = variant === "secondary" ? colors.hairline : "transparent";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <T variant="bodyMed" color={fg}>{label}</T>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    paddingHorizontal: s.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});