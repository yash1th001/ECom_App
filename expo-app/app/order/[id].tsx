import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { T } from "@/components/Text";
import { StageTracker } from "@/components/StageTracker";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { loadOrder } from "@/lib/orders";
import type { Order } from "@/types";
import { rupees } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";
import { notifyLocal } from "@/lib/notifications";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const prevStage = useRef<Order["stage"] | null>(null);

  useEffect(() => {
    if (!id) return;
    void loadOrder(String(id)).then((o) => { setOrder(o); prevStage.current = o?.stage ?? null; });
    const ch = supabase
      .channel(`order:${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        const next = payload.new as Order;
        setOrder(next);
        if (prevStage.current && prevStage.current !== next.stage) {
          void notifyLocal("Order updated", `Your order is now: ${next.stage.replace(/_/g, " ")}.`);
        }
        prevStage.current = next.stage;
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [id]);

  if (order === undefined) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center" }}><ActivityIndicator color={colors.gold} /></View>;
  if (!order) return <EmptyState title="Order not found" />;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View>
          <T variant="micro" color={colors.inkMuted}>ORDER · #{order.id.slice(0, 8).toUpperCase()}</T>
          <T variant="h1">{rupees(order.total_inr)}</T>
          <T variant="small" color={colors.inkMuted}>Placed {new Date(order.created_at).toLocaleString()}</T>
        </View>

        <View style={styles.card}>
          <StageTracker current={order.stage} />
          {order.awb_number && (
            <View style={{ paddingTop: s.sm, borderTopWidth: 1, borderTopColor: colors.hairline, gap: 4 }}>
              <T variant="micro" color={colors.inkMuted}>COURIER · {order.courier ?? "—"}</T>
              <T variant="price">AWB {order.awb_number}</T>
              {order.eta && <T variant="small" color={colors.inkSoft}>ETA {order.eta}</T>}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <T variant="h2">Items</T>
          {order.items.map((it) => (
            <View key={it.product_id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <T variant="bodyMed">{it.name}</T>
                <T variant="small" color={colors.inkMuted}>×{it.quantity} · {it.weight_g}g</T>
              </View>
              <T variant="price">{rupees(it.subtotal_inr)}</T>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: s.md, gap: s.sm },
  row: { flexDirection: "row", alignItems: "center", gap: s.md, paddingVertical: s.xs },
});