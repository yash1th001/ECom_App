import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";
import { radius, s } from "@/theme/spacing";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

type Profile = { full_name?: string; email?: string; phone?: string; referral_code?: string; kyc_verified?: boolean } | null;

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [profile, setProfile] = useState<Profile>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }: { data: Profile }) => setProfile(data));
  }, [user]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <T variant="h1">Profile</T>
        <View style={styles.card}>
          <Row label="Name" value={profile?.full_name ?? "—"} />
          <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
          <Row label="Phone" value={profile?.phone ?? user?.phone ?? "—"} />
          <Row label="Referred by" value={profile?.referral_code ?? "—"} />
          <Row label="KYC" value={profile?.kyc_verified ? "Verified" : "Not verified"} />
        </View>
        <Button label="View orders" variant="secondary" onPress={() => router.push("/(tabs)/orders")} />
        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <T variant="small" color={colors.inkMuted}>{label}</T>
      <T variant="bodyMed">{value}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: s.md, gap: s.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
});
