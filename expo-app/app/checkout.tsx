import { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { colors } from "@/theme/colors";
import { s, radius } from "@/theme/spacing";
import { useCartStore } from "@/stores/cartStore";
import { computeBreakdown } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { placeOrder } from "@/lib/orders";

const KYC_THRESHOLD = Number(process.env.EXPO_PUBLIC_KYC_THRESHOLD_INR ?? 200000);

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [placing, setPlacing] = useState(false);

  let base = 0, making = 0, gst = 0, total = 0;
  for (const it of items) {
    const b = computeBreakdown(it.product, it.locked_rate_inr_per_g, it.quantity);
    base += b.base; making += b.making; gst += b.gst; total += b.total;
  }

  async function submit() {
    if (!line1 || !city || pin.length < 5) {
      Alert.alert("Address incomplete", "Please provide the full delivery address.");
      return;
    }
    if (total >= KYC_THRESHOLD) {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("kyc_verified").eq("id", user.user!.id).maybeSingle();
      if (!profile?.kyc_verified) {
        Alert.alert(
          "KYC required",
          "For orders above ₹2,00,000, we're required to verify your identity (PAN card and government ID) before dispatch.",
          [{ text: "Not now" }, { text: "Verify now", onPress: () => router.push("/kyc") }],
        );
        return;
      }
    }
    setPlacing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: address } = await supabase
        .from("addresses")
        .insert({ user_id: user.user!.id, line1, city, pin })
        .select("id").single();
      // TODO: Razorpay / Stripe payment step here.
      const order = await placeOrder(items, address!.id);
      clear();
      router.replace({ pathname: "/order/[id]", params: { id: order.id } });
    } catch (e: any) {
      Alert.alert("Order failed", e?.message ?? "Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <T variant="h1">Checkout</T>

        <View style={{ gap: s.sm }}>
          <T variant="micro" color={colors.inkMuted}>DELIVERY ADDRESS</T>
          <TextInput style={styles.input} value={line1} onChangeText={setLine1} placeholder="Flat, building, street" placeholderTextColor={colors.inkMuted} />
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={colors.inkMuted} />
          <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="PIN / ZIP" placeholderTextColor={colors.inkMuted} keyboardType="number-pad" />
        </View>

        <PriceBreakdown b={{ base, making, gst, total }} />

        {total >= KYC_THRESHOLD && (
          <View style={styles.notice}>
            <T variant="small" color={colors.inkSoft}>
              This order is above ₹{KYC_THRESHOLD.toLocaleString("en-IN")}. Identity verification (PAN + government ID) will be requested before dispatch.
            </T>
          </View>
        )}

        <Button label="Place order" loading={placing} onPress={submit} />
        <T variant="micro" color={colors.inkMuted} style={{ textAlign: "center" }}>
          Payment step is a stub — wire Razorpay/Stripe in src/lib/orders.ts.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  input: {
    minHeight: 48, paddingHorizontal: s.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.surface, color: colors.ink,
    fontFamily: "Inter_400Regular", fontSize: 15,
  },
  notice: { padding: s.md, borderRadius: radius.md, backgroundColor: colors.goldTint, borderWidth: 1, borderColor: colors.goldSoft },
});