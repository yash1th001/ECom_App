import { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "@/components/Text";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";
import { s, radius } from "@/theme/spacing";
import { supabase } from "@/lib/supabase";

export default function Kyc() {
  const [pan, setPan] = useState("");
  const [gov, setGov] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      Alert.alert("Invalid PAN", "Enter a valid 10-character PAN, e.g. ABCDE1234F.");
      return;
    }
    if (gov.trim().length < 6) {
      Alert.alert("Government ID missing", "Enter a valid government ID number.");
      return;
    }
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("profiles").update({
        pan_number: pan.toUpperCase(),
        gov_id: gov.trim(),
        kyc_submitted_at: new Date().toISOString(),
      }).eq("id", u.user!.id);
      Alert.alert("Submitted", "We'll verify your documents shortly. You can return to checkout once verified.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Could not submit", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <T variant="h1">Verify your identity</T>
        <T variant="small" color={colors.inkMuted}>
          For orders above the high-value threshold, regulations require us to verify your identity before dispatch. Your documents are stored securely.
        </T>

        <View style={{ gap: 6 }}>
          <T variant="micro" color={colors.inkMuted}>PAN NUMBER</T>
          <TextInput style={styles.input} value={pan} onChangeText={setPan} placeholder="ABCDE1234F" autoCapitalize="characters" placeholderTextColor={colors.inkMuted} />
        </View>
        <View style={{ gap: 6 }}>
          <T variant="micro" color={colors.inkMuted}>GOVERNMENT ID (AADHAAR / PASSPORT)</T>
          <TextInput style={styles.input} value={gov} onChangeText={setGov} placeholder="ID number" placeholderTextColor={colors.inkMuted} />
        </View>

        <T variant="micro" color={colors.inkMuted}>
          Document photo upload is a stub for now — wire expo-image-picker + Supabase Storage in this screen.
        </T>
        <Button label="Submit for verification" loading={loading} onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: s.lg, gap: s.md },
  input: {
    minHeight: 52, paddingHorizontal: s.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.surface, color: colors.ink,
    fontFamily: "Inter_400Regular", fontSize: 15,
  },
});