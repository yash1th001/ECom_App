import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { T } from "./Text";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <T variant="h2" color={colors.inkSoft}>{title}</T>
      {subtitle ? <T variant="small" color={colors.inkMuted} style={{ textAlign: "center" }}>{subtitle}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: s.sm, padding: s.xl },
});