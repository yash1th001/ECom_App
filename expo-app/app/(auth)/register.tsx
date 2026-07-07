import { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/src/components/Text";
import { Button } from "@/src/components/Button";
import { colors } from "@/src/theme/colors";
import { s, radius } from "@/src/theme/spacing";
import { supabase } from "@/src/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!referral.trim()) {
      Alert.alert("Referral required", "Aurum is invite-only. You need a valid referral code to register.");
      return;
    }
    setLoading(true);
    try {
      // 1. verify referral exists and is active
      const { data: ref, error: refErr } = await supabase
        .from("referral_codes")
        .select("code, active")
        .eq("code", referral.trim().toUpperCase())
        .maybeSingle();
      if (refErr) throw refErr;
      if (!ref || !ref.active) {
        Alert.alert("Invalid referral", "That referral code is not recognised or is no longer active.");
        setLoading(false);
        return;
      }
      // 2. create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name, referral_code: ref.code } },
      });
      if (error) throw error;
      // 3. persist profile
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: name,
          email: email.trim(),
          referral_code: ref.code,
        });
      }
      Alert.alert("Check your email", "We sent a confirmation link. Open it, then sign in.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <T variant="h1">Create your account</T>
        <T variant="small" color={colors.inkMuted}>Aurum is invite-only. A valid referral code is required to register.</T>

        <Field label="Referral code" value={referral} onChange={setReferral} placeholder="AURUM-2026" autoCapitalize="characters" />
        <Field label="Full name" value={name} onChange={setName} placeholder="Anaya Kapoor" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="Minimum 8 characters" secure />

        <Button label="Create account" loading={loading} onPress={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, secure, keyboardType, autoCapitalize }: any) {
  return (
    <View style={{ gap: 6 }}>
      <T variant="micro" color={colors.inkMuted}>{label.toUpperCase()}</T>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.xl, gap: s.md },
  input: {
    minHeight: 52,
    paddingHorizontal: s.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
});