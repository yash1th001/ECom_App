import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { loadOrders } from "@/lib/orders";
import type { Order } from "@/types";
import { rupees } from "@/lib/formatters";

const STAGE_LABEL: Record<Order["stage"], string> = {
  placed: "Order Placed",
  insured_escrow: "Insured Escrow",
  dispatched: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setOrders(await loadOrders()); } catch { setOrders([]); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.wrap}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.gold} />}
      >
        <T variant="h1">Orders</T>
        {!orders ? (
          <ActivityIndicator color={colors.gold} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" subtitle="Your placed orders will appear here with stage tracking." />
        ) : (
          orders.map((o) => (
            <Pressable key={o.id} onPress={() => router.push({ pathname: "/order/[id]", params: { id: o.id } })} style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <T variant="micro" color={colors.inkMuted}>#{o.id.slice(0, 8).toUpperCase()}</T>
                <T variant="micro" color={colors.gold}>{STAGE_LABEL[o.stage]}</T>
              </View>
              <T variant="h2">{rupees(o.total_inr)}</T>
              <T variant="small" color={colors.inkMuted}>{o.items.length} item{o.items.length === 1 ? "" : "s"} · {new Date(o.created_at).toLocaleDateString()}</T>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: s.md, gap: 4 },
});