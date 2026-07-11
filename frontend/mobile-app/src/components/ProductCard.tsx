import { View, StyleSheet, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { T } from "./Text";
import { HallmarkBadge } from "./HallmarkBadge";
import { rupees, grams } from "@/lib/formatters";
import { usePriceStore } from "@/stores/priceStore";
import { computeBreakdown, ratePerGramFor } from "@/lib/pricing";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const quote = usePriceStore((s) => s.quote);
  const rate = quote ? ratePerGramFor(product.purity, quote.inr_per_g_24k, quote.inr_per_g_22k, quote.inr_per_g_18k) : 0;
  const total = rate ? computeBreakdown(product, rate).total : 0;

  return (
    <Link href={{ pathname: "/product/[id]", params: { id: product.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.imageWrap}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <T variant="micro" color={colors.inkMuted}>NO IMAGE</T>
            </View>
          )}
          {product.stock <= 0 && (
            <View style={styles.oosBadge}><T variant="micro" color={colors.surface}>OUT OF STOCK</T></View>
          )}
        </View>
        <View style={{ gap: 4 }}>
          <T variant="h2" numberOfLines={1}>{product.name}</T>
          <T variant="small" color={colors.inkMuted}>{product.purity} · {grams(product.weight_g)}</T>
        </View>
        <HallmarkBadge id={product.hallmark_id} />
        <View style={styles.priceRow}>
          <T variant="price" color={colors.gold}>{total ? rupees(total) : "Fetching…"}</T>
          <T variant="micro" color={colors.inkMuted}>ⓘ breakdown</T>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: s.md,
    gap: s.sm,
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.goldTint },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  oosBadge: { position: "absolute", top: 8, left: 8, backgroundColor: colors.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
});