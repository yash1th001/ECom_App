import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { T } from "./Text";
import { rupees } from "@/lib/formatters";
import type { Breakdown } from "@/lib/pricing";

export function PriceBreakdown({ b }: { b: Breakdown }) {
  return (
    <View style={styles.wrap}>
      <Row label="Base gold value" value={rupees(b.base)} />
      <Row label="Making charges" value={rupees(b.making)} />
      <Row label="GST" value={rupees(b.gst)} />
      <View style={styles.rule} />
      <Row label="Total" value={rupees(b.total)} bold />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <T variant={bold ? "bodyMed" : "body"} color={colors.inkSoft}>{label}</T>
      <T variant={bold ? "priceLg" : "price"} color={bold ? colors.ink : colors.inkSoft}>{value}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: s.sm, padding: s.md, borderRadius: 10, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  rule: { height: 1, backgroundColor: colors.hairline, marginVertical: s.xs },
});