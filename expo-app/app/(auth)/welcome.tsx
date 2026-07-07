import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { T } from "@/src/components/Text";
import { Button } from "@/src/components/Button";
import { PriceTicker } from "@/src/components/PriceTicker";
import { colors } from "@/src/theme/colors";
import { s } from "@/src/theme/spacing";

export default function Welcome() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.wrap}>
        <View style={{ gap: s.md }}>
          <T variant="micro" color={colors.gold}>AURUM · INVITE-ONLY</T>
          <T variant="display">Gold, precisely priced.</T>
          <T variant="body" color={colors.inkSoft}>
            Live market rates, hallmarked pieces, and a transparent breakdown on every price. This platform is invite-only — you'll need a referral to join.
          </T>
        </View>
        <PriceTicker />
        <View style={{ gap: s.sm }}>
          <Button label="Sign in" onPress={() => router.push("/(auth)/login")} />
          <Button label="I have a referral code" variant="secondary" onPress={() => router.push("/(auth)/register")} />
          <Link href="/(auth)/login" style={{ textAlign: "center", paddingVertical: s.sm }}>
            <T variant="small" color={colors.inkMuted}>Existing member? Sign in →</T>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: s.xl, gap: s.xl, justifyContent: "space-between" },
});