# Aurum — Gold & Jewelry (Expo)

Mobile-first React Native app for browsing, price-checking, and buying gold jewelry against **live market rates**. Built with Expo Router, Zustand, Supabase, and `expo-secure-store`.

> This app is a **React Native (Expo)** project. It does **not** run in the Lovable web preview — clone the folder to your machine and run it with Expo. See [`SETUP.md`](./SETUP.md).

---

## Documentation

| File | What it covers |
| --- | --- |
| [`SETUP.md`](./SETUP.md) | Local development: prerequisites, install, Supabase setup, environment variables, running on device/simulator. |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Building and shipping with EAS Build / EAS Submit to the App Store and Play Store, OTA updates, production Supabase, secrets. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Folder layout, state stores, pricing engine, price-lock, kill-switch, integration points. |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Coding conventions, PR checklist. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release history. |
| [`LICENSE`](./LICENSE) | MIT. |

---

## Quick start

```bash
cd expo-app
npm install
npm run web           # Runs on http://localhost:8081
```

Scan the QR with **Expo Go**, or test it in the web browser. The app runs in **Offline Mock Mode** by default if `.env` keys are unconfigured, allowing you to register with code `AURUM-2026` and verify login with OTP code `123456`.

---

## What's inside

- **Referral-gated auth** — signup requires a valid `referral_code`. Login via phone-OTP, email-OTP, or email + password.
- **Live pricing** — polls XAU gold rates every 15 s, fetches dynamic USD ➜ INR currency exchange rates from `open.er-api.com`, and derives pure 24K, 22K, and 18K rates per gram.
- **10-minute price lock** — cart items snapshot the current rate; a countdown re-quotes on expiry and warns before checkout if the price moved.
- **Catalog + filters** — purity, weight range, category, making-charge range. Every card has an "ⓘ" breakdown (base gold + making + GST).
- **Cart & checkout** — enforces a configurable minimum total weight (default 100 g). Above ₹2 L order value, prompts KYC upload before placing the order.
- **Orders** — realtime stage tracker: Placed ➜ Insured Escrow ➜ Dispatched ➜ Delivered (automatically simulates stage progression in development/mock mode).
- **KYC Document Picker** — uses native `expo-image-picker` to select or snap verification photos of PAN cards or Government IDs.
- **Kill switch** — if `settings.storefront_paused = true`, checkout is blocked with a clear message.
- **Secure storage** — tokens/session/PII cached via `expo-secure-store` (falls back to local storage on web).
- **Notifications** — local notifications for price-lock expiry and order stage changes.

## Payment & escrow simulator

`app/checkout.tsx` prompts you to choose between Stripe or Razorpay, triggers a loading payment overlay, verifies transaction success, and passes the authorization reference to `placeOrder()` in `src/lib/orders.ts`. You can easily swap this mock sheet for production SDKs in `orders.ts`.

## License

MIT — see [`LICENSE`](./LICENSE).