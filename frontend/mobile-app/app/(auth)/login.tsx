import { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";
import { s, radius } from "@/theme/spacing";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

type Mode = "email-otp" | "email-password" | "phone-otp";

export default function Login() {
  const [mode, setMode] = useState<Mode>("email-otp");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const keep = useAuthStore((s) => s.keepSignedIn);
  const setKeep = useAuthStore((s) => s.setKeepSignedIn);

  async function onSubmit() {
    setLoading(true);
    try {
      if (mode === "email-password") {
        const { error } = await supabase.auth.signInWithPassword({ email: id.trim(), password });
        if (error) throw error;
      } else if (mode === "email-otp") {
        const { error } = await supabase.auth.signInWithOtp({ email: id.trim() });
        if (error) throw error;
        router.push({ pathname: "/(auth)/otp", params: { identifier: id.trim(), channel: "email" } });
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone: id.trim() });
        if (error) throw error;
        router.push({ pathname: "/(auth)/otp", params: { identifier: id.trim(), channel: "sms" } });
      }
    } catch (e: any) {
      Alert.alert("Sign in failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.wrap}>
        <View style={{ gap: s.sm }}>
          <T variant="h1">Welcome back</T>
          <T variant="small" color={colors.inkMuted}>Sign in with phone or email. Password or one-time code.</T>
        </View>

        <View style={styles.tabs}>
          <Tab label="Email · OTP" active={mode === "email-otp"} onPress={() => setMode("email-otp")} />
          <Tab label="Email · Password" active={mode === "email-password"} onPress={() => setMode("email-password")} />
          <Tab label="Phone · OTP" active={mode === "phone-otp"} onPress={() => setMode("phone-otp")} />
        </View>

        <View style={{ gap: 6 }}>
          <T variant="micro" color={colors.inkMuted}>{mode === "phone-otp" ? "PHONE NUMBER (WITH COUNTRY CODE)" : "EMAIL"}</T>
          <TextInput
            value={id}
            onChangeText={setId}
            placeholder={mode === "phone-otp" ? "+91 98765 43210" : "you@example.com"}
            placeholderTextColor={colors.inkMuted}
            keyboardType={mode === "phone-otp" ? "phone-pad" : "email-address"}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {mode === "email-password" && (
          <View style={{ gap: 6 }}>
            <T variant="micro" color={colors.inkMuted}>PASSWORD</T>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.inkMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>
        )}

        <View style={styles.row}>
          <T variant="small" color={colors.inkSoft}>Keep me signed in</T>
          <Switch value={keep} onValueChange={setKeep} />
        </View>

        <Button
          label={mode === "email-password" ? "Sign in" : "Send one-time code"}
          loading={loading}
          onPress={onSubmit}
        />

        <Pressable onPress={() => router.push("/(auth)/register")}>
          <T variant="small" color={colors.inkMuted} style={{ textAlign: "center" }}>
            New here? <T variant="bodyMed" color={colors.gold}>Register with a referral →</T>
          </T>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <T variant="micro" color={active ? colors.ink : colors.inkMuted}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: s.xl, gap: s.md },
  tabs: { flexDirection: "row", gap: 6, marginTop: s.sm },
  tab: { flex: 1, paddingVertical: s.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.hairline, alignItems: "center" },
  tabActive: { borderColor: colors.gold, backgroundColor: colors.goldTint },
  input: {
    minHeight: 52, paddingHorizontal: s.md, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.hairline, backgroundColor: colors.surface, color: colors.ink,
    fontFamily: "Inter_400Regular", fontSize: 15,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: s.sm },
});