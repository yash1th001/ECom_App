import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PriceTicker } from "@/components/PriceTicker";
import { ProductCard } from "@/components/ProductCard";
import { T } from "@/components/Text";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { loadProducts, isStorefrontPaused } from "@/lib/products";
import type { Product } from "@/types";
import { router } from "expo-router";

export default function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const paused = await isStorefrontPaused();
      if (paused) { router.replace("/unavailable"); return; }
      const p = await loadProducts();
      setProducts(p);
    } catch (e: any) {
      setError(e?.message ?? "Could not load products");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.wrap}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.gold} />}
      >
        <View style={{ gap: 4 }}>
          <T variant="micro" color={colors.inkMuted}>TODAY</T>
          <T variant="display">Featured pieces</T>
          <T variant="small" color={colors.inkMuted}>Every price is quoted against the live 22K / 24K market rate.</T>
        </View>
        <PriceTicker />

        {error ? (
          <EmptyState title="Something went wrong" subtitle={error} />
        ) : !products ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: s.xl }} />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" subtitle="Check back soon." />
        ) : (
          <View style={styles.grid}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.lg },
  grid: { gap: s.md },
});