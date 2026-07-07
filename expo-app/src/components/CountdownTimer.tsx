import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { T } from "./Text";
import { timeLeft } from "@/lib/formatters";
import { useNow } from "@/hooks/useNow";

export function CountdownTimer({ lockedAt, durationMs }: { lockedAt: number; durationMs: number }) {
  const now = useNow(1000);
  const remaining = lockedAt + durationMs - now;
  const expired = remaining <= 0;
  return (
    <View style={[styles.wrap, expired && { borderColor: colors.danger }]}>
      <T variant="micro" color={expired ? colors.danger : colors.inkMuted}>
        {expired ? "PRICE LOCK EXPIRED" : "PRICE LOCKED"}
      </T>
      <T variant="priceSm" color={expired ? colors.danger : colors.gold}>{timeLeft(remaining)}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: s.sm,
    paddingHorizontal: s.sm, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1, borderColor: colors.hairline, alignSelf: "flex-start",
  },
});