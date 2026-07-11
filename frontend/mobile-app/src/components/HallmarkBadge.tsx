import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { s } from "@/theme/spacing";
import { T } from "./Text";

export function HallmarkBadge({ id }: { id?: string | null }) {
  return (
    <View style={styles.wrap}>
      <T variant="micro" color={colors.gold}>HALLMARK</T>
      {id ? <T variant="micro" color={colors.inkSoft}>· {id}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: s.sm, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1, borderColor: colors.goldTint, backgroundColor: colors.goldTint,
    alignSelf: "flex-start",
  },
});