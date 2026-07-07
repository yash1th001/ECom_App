import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { isStorefrontPaused } from "@/lib/products";

export default function Unavailable() {
  async function retry() {
    const paused = await isStorefrontPaused();
    if (!paused) router.replace("/(tabs)");
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.wrap}>
        <T variant="micro" color={colors.gold}>PAUSED</T>
        <T variant="display">The storefront is temporarily unavailable.</T>
        <T variant="body" color={colors.inkSoft}>
          Gold rates or inventory are being updated. Purchases are paused until we're back. Your cart and account are safe.
        </T>
        <Button label="Try again" onPress={retry} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: s.xl, gap: s.md, justifyContent: "center" },
});