import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "@/components/Text";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";
import { s, radius } from "@/theme/spacing";
import { loadProducts, type ProductFilters } from "@/lib/products";
import type { Product, Purity } from "@/types";

const PURITIES: Purity[] = ["18K", "22K", "24K"];
const CATEGORIES = ["Rings", "Chains", "Bracelets", "Earrings", "Pendants", "Coins"];
const WEIGHT_BANDS = [
  { label: "≤ 10 g", min: 0, max: 10 },
  { label: "10–50 g", min: 10, max: 50 },
  { label: "50–100 g", min: 50, max: 100 },
  { label: "> 100 g", min: 100, max: 10000 },
];
const MAKING_BANDS = [
  { label: "≤ 5%", min: 0, max: 5 },
  { label: "5–10%", min: 5, max: 10 },
  { label: "> 10%", min: 10, max: 100 },
];

export default function Search() {
  const [q, setQ] = useState("");
  const [purity, setPurity] = useState<Purity[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [wBand, setWBand] = useState<number | null>(null);
  const [mBand, setMBand] = useState<number | null>(null);
  const [items, setItems] = useState<Product[] | null>(null);

  const filters: ProductFilters = useMemo(() => ({
    search: q || undefined,
    purity: purity.length ? purity : undefined,
    category: cats.length ? cats : undefined,
    minWeight: wBand != null ? WEIGHT_BANDS[wBand].min : undefined,
    maxWeight: wBand != null ? WEIGHT_BANDS[wBand].max : undefined,
    minMaking: mBand != null ? MAKING_BANDS[mBand].min : undefined,
    maxMaking: mBand != null ? MAKING_BANDS[mBand].max : undefined,
  }), [q, purity, cats, wBand, mBand]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    loadProducts(filters).then((p) => { if (!cancelled) setItems(p); }).catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [filters]);

  function toggle<T>(v: T, arr: T[], set: (a: T[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search rings, chains, coins…"
          placeholderTextColor={colors.inkMuted}
          style={styles.searchInput}
        />
      </View>
      <ScrollView contentContainerStyle={styles.wrap}>
        <FilterRow label="Purity">
          {PURITIES.map((p) => (
            <Chip key={p} label={p} active={purity.includes(p)} onPress={() => toggle(p, purity, setPurity)} />
          ))}
        </FilterRow>
        <FilterRow label="Category">
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={cats.includes(c)} onPress={() => toggle(c, cats, setCats)} />
          ))}
        </FilterRow>
        <FilterRow label="Weight">
          {WEIGHT_BANDS.map((b, i) => (
            <Chip key={b.label} label={b.label} active={wBand === i} onPress={() => setWBand(wBand === i ? null : i)} />
          ))}
        </FilterRow>
        <FilterRow label="Making charge">
          {MAKING_BANDS.map((b, i) => (
            <Chip key={b.label} label={b.label} active={mBand === i} onPress={() => setMBand(mBand === i ? null : i)} />
          ))}
        </FilterRow>

        {!items ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: s.xl }} />
        ) : items.length === 0 ? (
          <EmptyState title="No matches" subtitle="Try loosening your filters." />
        ) : (
          <View style={{ gap: s.md, marginTop: s.md }}>
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: s.xs }}>
      <T variant="micro" color={colors.inkMuted}>{label.toUpperCase()}</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: s.lg }}>
        {children}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <T variant="small" color={active ? colors.ink : colors.inkSoft}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { padding: s.lg, paddingBottom: s.sm },
  searchInput: {
    minHeight: 48, paddingHorizontal: s.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.surface, color: colors.ink,
    fontFamily: "Inter_400Regular", fontSize: 15,
  },
  wrap: { paddingHorizontal: s.lg, paddingBottom: s.xl, gap: s.md },
  chip: {
    paddingHorizontal: s.md, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.goldTint },
});