# Architecture

## Stack

- **Expo SDK 51** + **Expo Router 3** (file-based routing, typed routes on)
- **React Native 0.74** with New Architecture (Fabric + TurboModules) enabled
- **Zustand** for client state (auth, cart, live price)
- **Supabase** (Postgres + Auth + Storage + Realtime) as the backend
- **expo-secure-store** for all token/session/PII persistence
- **expo-notifications** for local push (price-lock expiry, stage changes)

## Folder layout

```
expo-app/
├── app/                        Expo Router screens
│   ├── _layout.tsx             Root providers, fonts, splash
│   ├── index.tsx               Auth gate / redirect
│   ├── (auth)/                 Welcome, login, register, OTP
│   ├── (tabs)/                 Home, Search, Cart, Orders, Profile
│   ├── product/[id].tsx        Product detail + live price
│   ├── checkout.tsx            Cart review + KYC gate + place order
│   ├── kyc.tsx                 Document upload
│   ├── order/[id].tsx          Realtime stage tracker
│   └── unavailable.tsx         Kill-switch screen
├── src/
│   ├── components/             Reusable UI (Button, PriceTicker, …)
│   ├── hooks/                  useNow, useHydrated, …
│   ├── lib/                    supabase client, priceApi, pricing math, orders
│   ├── stores/                 auth, cart, price (Zustand)
│   ├── theme/                  colors, spacing, typography tokens
│   └── types/                  Shared TS types
├── supabase/
│   └── schema.sql              Full schema + RLS + seed
├── app.json                    Expo config
├── eas.json                    EAS build/submit profiles
└── .env.example
```

## State stores

| Store | Responsibility | Persistence |
| --- | --- | --- |
| `authStore` | session, user, referral status | `expo-secure-store` |
| `cartStore` | items, snapshot prices, lock expiry | `expo-secure-store` |
| `priceStore` | live spot price, derived 22K/24K INR/g, last-updated ts | in-memory (re-fetched on cold start) |

## Pricing engine

1. `src/lib/priceApi.ts` polls `EXPO_PUBLIC_GOLD_API_URL` every 15 s.
2. USD/oz is converted to INR/g using `EXPO_PUBLIC_USD_INR` (swap for a live FX feed later).
3. `src/lib/pricing.ts` derives:
   - **24K rate** = spot INR/g
   - **22K rate** = 24K × (22/24)
   - **Item price** = weight × purity-rate + making charges + GST (`EXPO_PUBLIC_GST_PERCENT`)
4. `PriceTicker` component subscribes to `priceStore` and renders a persistent bar.

## Price lock

- On "Add to cart", the current derived rate is snapshotted onto the cart item along with `lockedUntil = now + EXPO_PUBLIC_PRICE_LOCK_MINUTES`.
- `CountdownTimer` component renders remaining time; on expiry it re-quotes at the current live rate and shows a diff banner.
- Checkout blocks if any item has an expired lock without user confirmation.

## Kill switch

- `settings.storefront_paused` (boolean, single-row table) is fetched at app start and via Supabase Realtime.
- When `true`, `checkout.tsx` redirects to `unavailable.tsx`.

## Auth flow

1. Welcome → Register (requires valid `referral_code`) or Login.
2. Sign-in options: email + password, email OTP, phone OTP.
3. Session persisted via `expo-secure-store` (never `AsyncStorage`).
4. Route gate in `app/index.tsx` redirects unauthenticated users to `(auth)/welcome`.

## Orders

- `orders` row created via `placeOrder()`.
- `order_stages` child rows track: `placed`, `insured_escrow`, `dispatched`, `delivered`.
- Client subscribes with Supabase Realtime on `order/[id]` — no polling.
- Local notification fires when a new stage row is inserted.

## Integration points (stubbed)

| Area | File | What to wire |
| --- | --- | --- |
| Payments | `app/checkout.tsx` → `placeOrder()` | Razorpay (`react-native-razorpay`) or Stripe (`@stripe/stripe-react-native`) |
| Live FX (USD→INR) | `src/lib/pricing.ts` | Any FX API, replace the env constant |
| Courier AWB | `src/lib/orders.ts` | Shiprocket / Delhivery API |
| KYC verification | `app/kyc.tsx` | Digio / IDfy / manual admin review |
| Crash reporting | `app/_layout.tsx` | `sentry-expo` |

## Security notes

- Only `EXPO_PUBLIC_*` vars ship in the bundle. Private keys stay in Supabase Edge Functions.
- All privileged writes go through Postgres RLS scoped to `auth.uid()`.
- Admin actions gated by the `has_role(uid, 'admin')` security-definer function; roles live in a separate `user_roles` table (never on `profiles`).
- Tokens are encrypted at rest via `expo-secure-store` (Keychain on iOS, Keystore on Android).