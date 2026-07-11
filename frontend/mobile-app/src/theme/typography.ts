import { TextStyle } from "react-native";

export const fonts = {
  serif: "CormorantGaramond_600SemiBold",
  serifRegular: "CormorantGaramond_500Medium",
  sans: "Inter_400Regular",
  sansMed: "Inter_500Medium",
  sansBold: "Inter_600SemiBold",
  mono: "JetBrainsMono_500Medium",
  monoBold: "JetBrainsMono_600SemiBold",
};

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38 } as TextStyle,
  h1: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32 } as TextStyle,
  h2: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26 } as TextStyle,
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 } as TextStyle,
  bodyMed: { fontFamily: fonts.sansMed, fontSize: 15, lineHeight: 22 } as TextStyle,
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 } as TextStyle,
  micro: { fontFamily: fonts.sansMed, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 } as TextStyle,
  price: { fontFamily: fonts.monoBold, fontSize: 16, fontVariant: ["tabular-nums"] } as TextStyle,
  priceLg: { fontFamily: fonts.monoBold, fontSize: 22, fontVariant: ["tabular-nums"] } as TextStyle,
  priceSm: { fontFamily: fonts.mono, fontSize: 13, fontVariant: ["tabular-nums"] } as TextStyle,
};