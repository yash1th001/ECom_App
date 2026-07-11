import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Pressable } from "react-native";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { T } from "./Text";
import { usePriceStore } from "@/stores/priceStore";
import { rupeesDec } from "@/lib/formatters";

export function PriceTicker({ onPress }: { onPress?: () => void }) {
  const { quote, loading, error, refresh } = usePriceStore();
  const pulse = useRef(new Animated.Value(1)).current;
  const lastFetched = quote?.fetched_at;

  useEffect(() => {
    if (!lastFetched) return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.35, duration: 180, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [lastFetched, pulse]);

  return (
    <Pressable onPress={onPress ?? refresh} style={styles.wrap} accessibilityRole="button" accessibilityLabel="Live gold rate">
      <View style={styles.row}>
        <Animated.View style={[styles.dot, { transform: [{ scale: pulse }] }]} />
        <T variant="micro" color={colors.inkMuted}>LIVE  ·  {loading ? "SYNCING" : error ? "OFFLINE" : "UPDATED"}</T>
      </View>
      <View style={styles.rates}>
        <View style={styles.rateCol}>
          <T variant="micro" color={colors.inkMuted}>22K / g</T>
          <T variant="price" color={colors.gold}>{quote ? rupeesDec(quote.inr_per_g_22k) : "—"}</T>
        </View>
        <View style={styles.sep} />
        <View style={styles.rateCol}>
          <T variant="micro" color={colors.inkMuted}>24K / g</T>
          <T variant="price" color={colors.gold}>{quote ? rupeesDec(quote.inr_per_g_24k) : "—"}</T>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: s.md,
    gap: s.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  rates: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rateCol: { flex: 1 },
  sep: { width: 1, alignSelf: "stretch", backgroundColor: colors.hairline, marginHorizontal: s.md },
});