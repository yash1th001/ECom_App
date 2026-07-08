import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts as useSerif, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { usePriceStore } from "@/stores/priceStore";
import { useAuthStore } from "@/stores/authStore";
import { ensureNotifPermission } from "@/lib/notifications";
import { crashReporter } from "@/lib/crashReporter";

export default function RootLayout() {
  const [fontsLoaded] = useSerif({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  const startPolling = usePriceStore((s) => s.startPolling);
  const authInit = useAuthStore((s) => s.init);
  const initialised = useAuthStore((s) => s.initialised);
  const session = useAuthStore((s) => s.session);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    crashReporter.init();
    void authInit();
  }, [authInit]);

  useEffect(() => {
    const stop = startPolling(15000);
    void ensureNotifPermission();
    return stop;
  }, [startPolling]);

  useEffect(() => {
    if (!initialised || !fontsLoaded) return;
    const t = setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";
      if (!session && !inAuthGroup) {
        router.replace("/(auth)/welcome");
      } else if (session && inAuthGroup) {
        router.replace("/(tabs)");
      }
    }, 0);
    return () => clearTimeout(t);
  }, [initialised, fontsLoaded, session, segments, router]);

  if (!fontsLoaded || !initialised) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: "CormorantGaramond_600SemiBold", fontSize: 22 },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: "" }} />
        <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="kyc" options={{ title: "Verify identity" }} />
        <Stack.Screen name="unavailable" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}