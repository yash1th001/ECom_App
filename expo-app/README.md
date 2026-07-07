# Aurum — Gold & Jewelry (Expo)

Mobile-first React Native app for browsing, price-checking, and buying gold jewelry against live market rates. Built with Expo Router, Zustand, Supabase, and expo-secure-store.

> This project was generated in a web-only sandbox and cannot preview here. Copy this folder to your machine and run it locally with Expo.

## Prerequisites
- Node.js 20+
- A Supabase project (free tier is fine). Run `supabase/schema.sql` in the SQL editor to create tables, RLS policies, and seed products.
- Expo Go on your phone, or an iOS/Android simulator.

## Setup

```bash
cd expo-app
cp .env.example .env
# fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npx expo start
```

Scan the QR with Expo Go, or press `i` / `a` for a simulator.

## What's inside

- **Referral-gated auth** — signup requires a valid `referral_code` row. Login via phone-OTP, email-OTP, or email+password.
- **Live pricing** — polls `https://api.gold-api.com/price/XAU` every 15 s, converts USD/oz → INR/g, and derives 22K/24K rates. Ticker is always visible.
- **10-minute price lock** — when an item is added to the cart, its rate is snapshotted; a countdown re-quotes it on expiry and warns the user before checkout if the price moved.
- **Catalog + filters** — purity, weight range, category, making-charge range. Every card has an "ⓘ" breakdown showing base gold + making + GST.
- **Cart & checkout** — enforces a configurable minimum total weight (default 100 g). Above ₹2 L order value, prompts KYC upload before placing the order. Payment step is stubbed for you to wire Razorpay/Stripe.
- **Orders** — stage tracker: Placed → Insured Escrow → Dispatched → Delivered. Optional courier AWB module.
- **Kill switch** — if `settings.storefront_paused = true`, checkout is blocked with a clear message.
- **Secure storage** — all tokens, session, and PII cached via `expo-secure-store`, never plain `AsyncStorage`.
- **Notifications** — local notifications for price-lock expiry and order stage changes via `expo-notifications`.

## Payment integration point
`app/checkout.tsx` calls `placeOrder()` in `src/lib/orders.ts`. Insert your Razorpay/Stripe SDK call there. Both are drop-in via `react-native-razorpay` or `@stripe/stripe-react-native`.

## File map
See `app/` for screens (Expo Router file-based routing) and `src/` for components, stores, and libs.