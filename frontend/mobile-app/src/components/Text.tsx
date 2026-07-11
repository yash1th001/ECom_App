import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { type as t } from "@/theme/typography";

type V = keyof typeof t;
export function T({ variant = "body", color, style, ...rest }: TextProps & { variant?: V; color?: string }) {
  return <RNText {...rest} style={[styles.base, t[variant], color ? { color } : null, style]} />;
}
const styles = StyleSheet.create({ base: { color: colors.ink } });