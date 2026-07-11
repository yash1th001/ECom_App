import { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";
import { s, radius } from "@/theme/spacing";
import { supabase } from "@/lib/supabase";

const RESEND_SEC = 30;

export default function Otp() {
  const { identifier, channel } = useLocalSearchParams<{ identifier: string; channel: "email" | "sms" }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SEC);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function verify() {
    if (!identifier) return;
    setLoading(true);
    try {
      const params: any = channel === "email"
        ? { email: identifier, token: code.trim(), type: "email" }
        : { phone: identifier, token: code.trim(), type: "sms" };
      const { error } = await supabase.auth.verifyOtp(params);
      if (error) throw error;
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Invalid code", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!identifier || cooldown > 0) return;
    try {
      const params: any = channel === "email" ? { email: identifier } : { phone: identifier };
      const { error } = await supabase.auth.signInWithOtp(params);
      if (error) throw error;
      setCooldown(RESEND_SEC);
    } catch (e: any) {
      Alert.alert("Could not resend", e?.message ?? "Please try again.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.wrap}>
        <T variant="h1">Enter the code</T>
        <T variant="small" color={colors.inkMuted}>
          We sent a 6-digit code to {identifier}. It expires shortly.
        </T>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={colors.inkMuted}
          keyboardType="number-pad"
          maxLength={6}
          textContentType={channel === "sms" ? "oneTimeCode" : undefined}
          autoComplete={channel === "sms" ? "sms-otp" : "one-time-code"}
          style={styles.otpInput}
        />
        <Button label="Verify" loading={loading} onPress={verify} />
        <Pressable onPress={resend} disabled={cooldown > 0}>
          <T variant="small" color={cooldown > 0 ? colors.inkMuted : colors.gold} style={{ textAlign: "center" }}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </T>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: s.xl, gap: s.md },
  otpInput: {
    minHeight: 64, textAlign: "center", fontSize: 28, letterSpacing: 8,
    fontFamily: "JetBrainsMono_600SemiBold",
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.surface, color: colors.ink,
  },
});