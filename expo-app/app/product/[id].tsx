import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { HallmarkBadge } from "@/components/HallmarkBadge";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { PriceTicker } from "@/components/PriceTicker";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { loadProduct, loadSimilar } from "@/lib/products";
import type { Product } from "@/types";
import { usePriceStore } from "@/stores/priceStore";
import { useCartStore } from "@/stores/cartStore";
import { computeBreakdown, ratePerGramFor } from "@/lib/pricing";
import { grams } from "@/lib/formatters";

const MIN_WEIGHT = Number(process.env.EXPO_PUBLIC_MIN_ORDER_WEIGHT_G ?? 100);

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [similar, setSimilar] = useState<Product[]>([]);
  const quote = usePriceStore((s) => s.quote);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const p = await loadProduct(String(id));
      setProduct(p);
      if (p) setSimilar(await loadSimilar(p));
    })();
  }, [id]);

  if (product === undefined) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center" }}><ActivityIndicator color={colors.gold} /></View>;
  if (!product) return <EmptyState title="Not found" subtitle="This product may no longer be available." />;

  const rate = quote ? ratePerGramFor(product.purity, quote.inr_per_g_24k, quote.inr_per_g_22k, quote.inr_per_g_18k) : 0;
  const breakdown = rate ? computeBreakdown(product, rate) : null;
  const belowMin = product.weight_g < MIN_WEIGHT;

  function add() {
    if (!quote) { Alert.alert("Live rate unavailable", "Please retry in a moment."); return; }
    addToCart(product);
    Alert.alert("Added to cart", `Price locked for ${Math.round(useCartStore.getState().lockMs() / 60000)} minutes.`, [
      { text: "Keep browsing" },
      { text: "Go to cart", onPress: () => router.push("/(tabs)/cart") },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.wrap}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.hero} resizeMode="cover" />
      ) : (
        <View style={[styles.hero, { backgroundColor: colors.goldTint }]} />
      )}

      <View style={{ gap: 4 }}>
        <T variant="micro" color={colors.inkMuted}>{product.category.toUpperCase()}</T>
        <T variant="h1">{product.name}</T>
        <T variant="small" color={colors.inkMuted}>{product.purity} · {grams(product.weight_g)} · Rating {product.rating.toFixed(1)} ({product.review_count})</T>
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        <HallmarkBadge id={product.hallmark_id} />
        {product.coa_id && (
          <View style={styles.badge}>
            <T variant="micro" color={colors.inkSoft}>COA · {product.coa_id}</T>
          </View>
        )}
        <View style={styles.badge}>
          <T variant="micro" color={product.stock > 0 ? colors.success : colors.danger}>
            {product.stock > 0 ? `IN STOCK · ${product.stock}` : "OUT OF STOCK"}
          </T>
        </View>
      </View>

      <PriceTicker />
      {breakdown && <PriceBreakdown b={breakdown} />}

      {product.description && <T variant="body" color={colors.inkSoft}>{product.description}</T>}

      {belowMin && (
        <View style={styles.noticeSoft}>
          <T variant="small" color={colors.inkSoft}>
            This piece alone is below the platform's {grams(MIN_WEIGHT)} minimum order weight. You'll need to add more items before checkout.
          </T>
        </View>
      )}

      <Button label={product.stock > 0 ? "Add to cart · lock price" : "Out of stock"} disabled={product.stock <= 0} onPress={add} />

      {similar.length > 0 && (
        <View style={{ gap: s.md, marginTop: s.lg }}>
          <T variant="h2">Similar pieces</T>
          {similar.map((p) => <ProductCard key={p.id} product={p} />)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md, paddingBottom: s.xxl },
  hero: { width: "100%", aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.goldTint },
  badge: {
    paddingHorizontal: s.sm, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface,
  },
  noticeSoft: {
    padding: s.md, borderRadius: radius.md, backgroundColor: colors.goldTint, borderWidth: 1, borderColor: colors.goldSoft,
  },
});