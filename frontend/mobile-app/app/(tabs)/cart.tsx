import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { useCartStore } from "@/stores/cartStore";
import { computeBreakdown } from "@/lib/pricing";
import { rupees, grams } from "@/lib/formatters";
import { notifyLocal } from "@/lib/notifications";
import { useNow } from "@/hooks/useNow";

const MIN_WEIGHT = Number(process.env.EXPO_PUBLIC_MIN_ORDER_WEIGHT_G ?? 100);

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const relockExpired = useCartStore((s) => s.relockExpired);
  const lockMs = useCartStore((s) => s.lockMs());
  const now = useNow(1000);
  const [notified, setNotified] = useState<Set<string>>(new Set());

  // Fire local notifications ~30s before expiry, once per item lock window.
  useEffect(() => {
    items.forEach((it) => {
      const key = `${it.product.id}:${it.locked_at}`;
      const msLeft = it.locked_at + lockMs - now;
      if (msLeft > 0 && msLeft < 30_000 && !notified.has(key)) {
        void notifyLocal("Price lock expiring", `${it.product.name} lock ends in under 30 seconds.`);
        setNotified((prev) => new Set(prev).add(key));
      }
    });
  }, [items, now, lockMs, notified]);

  const totals = useMemo(() => {
    let base = 0, making = 0, gst = 0, total = 0, weight = 0;
    for (const it of items) {
      const b = computeBreakdown(it.product, it.locked_rate_inr_per_g, it.quantity);
      base += b.base; making += b.making; gst += b.gst; total += b.total;
      weight += it.product.weight_g * it.quantity;
    }
    return { base, making, gst, total, weight };
  }, [items]);

  const meetsMin = totals.weight >= MIN_WEIGHT;
  const progress = Math.min(1, totals.weight / MIN_WEIGHT);

  async function toCheckout() {
    const { requoted, priceMovedInr } = relockExpired();
    if (requoted.length > 0) {
      Alert.alert(
        "Prices re-quoted",
        `${requoted.length} item${requoted.length === 1 ? "" : "s"} had an expired price lock. Total changed by ${priceMovedInr >= 0 ? "+" : "-"}${rupees(Math.abs(priceMovedInr))}.`,
        [{ text: "Review cart" }, { text: "Continue", onPress: () => router.push("/checkout") }],
      );
      return;
    }
    router.push("/checkout");
  }

  if (items.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState title="Your cart is empty" subtitle="Add pieces to lock their price for 10 minutes." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <T variant="h1">Cart</T>

        {items.map((it) => {
          const b = computeBreakdown(it.product, it.locked_rate_inr_per_g, it.quantity);
          return (
            <View key={it.product.id + it.locked_at} style={styles.item}>
              <View style={{ flexDirection: "row", gap: s.md }}>
                {it.product.image_url ? (
                  <Image source={{ uri: it.product.image_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: colors.goldTint }]} />
                )}
                <View style={{ flex: 1, gap: 4 }}>
                  <T variant="h2" numberOfLines={2}>{it.product.name}</T>
                  <T variant="small" color={colors.inkMuted}>{it.product.purity} · {grams(it.product.weight_g)}</T>
                  <CountdownTimer lockedAt={it.locked_at} durationMs={lockMs} />
                </View>
              </View>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => setQty(it.product.id, it.quantity - 1)} style={styles.qtyBtn}><T variant="bodyMed">−</T></Pressable>
                <T variant="price">{it.quantity}</T>
                <Pressable onPress={() => setQty(it.product.id, it.quantity + 1)} style={styles.qtyBtn}><T variant="bodyMed">+</T></Pressable>
                <View style={{ flex: 1 }} />
                <T variant="priceLg" color={colors.gold}>{rupees(b.total)}</T>
              </View>
              <Pressable onPress={() => remove(it.product.id)}>
                <T variant="small" color={colors.danger}>Remove</T>
              </Pressable>
            </View>
          );
        })}

        <PriceBreakdown b={{ base: totals.base, making: totals.making, gst: totals.gst, total: totals.total }} />

        <View style={styles.minCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <T variant="bodyMed">Minimum order weight</T>
            <T variant="price" color={meetsMin ? colors.success : colors.danger}>{grams(totals.weight)} / {grams(MIN_WEIGHT)}</T>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFg, { width: `${progress * 100}%`, backgroundColor: meetsMin ? colors.success : colors.gold }]} />
          </View>
          {!meetsMin && (
            <T variant="small" color={colors.inkMuted}>
              Add {grams(MIN_WEIGHT - totals.weight)} more to reach the checkout minimum.
            </T>
          )}
        </View>

        <Button label={meetsMin ? "Proceed to checkout" : "Minimum weight not met"} disabled={!meetsMin} onPress={toCheckout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  item: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: s.md, gap: s.sm },
  thumb: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.goldTint },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: s.md, marginTop: s.xs },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.bg,
  },
  minCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline, padding: s.md, gap: s.sm },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: colors.hairline, overflow: "hidden" },
  progressFg: { height: "100%" },
});