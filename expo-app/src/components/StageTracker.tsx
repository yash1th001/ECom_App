import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { T } from "./Text";
import type { OrderStage } from "@/types";

const STAGES: { key: OrderStage; label: string }[] = [
  { key: "placed", label: "Order Placed" },
  { key: "insured_escrow", label: "Insured Escrow" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

export function StageTracker({ current }: { current: OrderStage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === current);
  return (
    <View style={styles.wrap}>
      {STAGES.map((stage, i) => {
        const active = i <= currentIdx;
        return (
          <View key={stage.key} style={styles.row}>
            <View style={styles.col}>
              <View style={[styles.dot, active && styles.dotActive]} />
              {i < STAGES.length - 1 && <View style={[styles.line, active && i < currentIdx && styles.lineActive]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: s.lg }}>
              <T variant="bodyMed" color={active ? colors.ink : colors.inkMuted}>{stage.label}</T>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: s.sm },
  row: { flexDirection: "row", gap: s.md, minHeight: 44 },
  col: { alignItems: "center", width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.hairline, marginTop: 4 },
  dotActive: { backgroundColor: colors.gold },
  line: { width: 2, flex: 1, backgroundColor: colors.hairline, marginTop: 2 },
  lineActive: { backgroundColor: colors.gold },
});