import { Tabs } from "expo-router";
import { View } from "react-native";
import { colors } from "@/theme/colors";
import { T } from "@/components/Text";
import { useCartStore } from "@/stores/cartStore";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <T variant="micro" color={focused ? colors.gold : colors.inkMuted}>{label}</T>;
}

export default function TabsLayout() {
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: "CormorantGaramond_600SemiBold", fontSize: 22, color: colors.ink },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Aurum", tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} /> }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ focused }) => <TabIcon label="SEARCH" focused={focused} /> }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center" }}>
              <TabIcon label="CART" focused={focused} />
              {cartCount > 0 && <T variant="micro" color={colors.gold}>· {cartCount}</T>}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ focused }) => <TabIcon label="ORDERS" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon label="PROFILE" focused={focused} /> }} />
    </Tabs>
  );
}