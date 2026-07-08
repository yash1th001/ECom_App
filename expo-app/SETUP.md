# Setup — Local Development

End-to-end instructions to run Aurum on your machine.

---

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **20 LTS** | Use `nvm install 20 && nvm use 20`. A `.nvmrc` is included. |
| npm | 10+ | Ships with Node 20. `pnpm` / `bun` / `yarn` also work. |
| Git | any | For cloning. |
| Expo Go app | latest | Install from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent). |
| Xcode | 15+ (macOS only) | Optional — for iOS simulator. |
| Android Studio | latest | Optional — for Android emulator. |
| Supabase account | free tier | https://supabase.com |

No native build tools are required for development with Expo Go.

---

## 2. Clone and install

```bash
git clone <your-repo-url>
cd expo-app
npm install
```

---

## 3. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project. Region: closest to your users.
2. Wait ~1 minute for provisioning.
3. Open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This creates:
   - `profiles`, `referral_codes`, `products`, `carts`, `orders`, `order_stages`, `kyc_documents`, `settings` tables
   - Row-Level-Security policies scoped to `auth.uid()`
   - The `has_role()` security-definer helper and `app_role` enum
   - Seed rows: sample products, one referral code (`AURUM-TEST`), and `settings.storefront_paused = false`
4. Open **Authentication → Providers** and enable:
   - **Email** (magic link + password)
   - **Phone** (choose Twilio, MessageBird, or Vonage and paste credentials — required for phone-OTP signup)
5. Open **Storage** and create a private bucket named `kyc-documents`.
6. Open **Project Settings → API** and copy:
   - `Project URL`
   - `anon` public key

---

## 4. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | `https://abcd.supabase.co` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | `eyJhbGci…` | Supabase anon key (publishable, safe to ship) |
| `EXPO_PUBLIC_GOLD_API_URL` | | `https://api.gold-api.com/price/XAU` | Live spot-price endpoint |
| `EXPO_PUBLIC_USD_INR` | | `83.5` | Fallback FX rate used until a live FX feed is wired |
| `EXPO_PUBLIC_MIN_ORDER_WEIGHT_G` | | `100` | Minimum total cart weight (grams) |
| `EXPO_PUBLIC_KYC_THRESHOLD_INR` | | `200000` | Order value above which KYC is required |
| `EXPO_PUBLIC_GST_PERCENT` | | `3` | GST applied on invoice |
| `EXPO_PUBLIC_PRICE_LOCK_MINUTES` | | `10` | Cart price-lock window |

> Only `EXPO_PUBLIC_*` variables are exposed to the app bundle. Never put service-role keys or private secrets there.

---

## 5. Run the app

```bash
npx expo start
```

Then choose one:

| Target | How |
| --- | --- |
| Physical device | Scan the QR from the terminal with the Expo Go app (iOS: Camera; Android: Expo Go's built-in scanner). Phone and dev machine must be on the same Wi-Fi, or use `--tunnel`. |
| iOS simulator | Press `i` (macOS + Xcode required). |
| Android emulator | Press `a` (Android Studio AVD must be running). |
| Web preview (limited) | Press `w`. Many native modules won't work — use only for quick UI checks. |

### Reload / debug shortcuts

- `r` — reload
- `j` — open Chrome DevTools
- `m` — toggle dev menu on device
- Shake device — dev menu on hardware

---

## 6. Seed a test user

1. Sign up in-app using referral code **`AURUM-TEST`**.
2. To make yourself an admin, open Supabase SQL editor and run:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('<your auth.uid>', 'admin');
   ```

Your `auth.uid` is visible under **Authentication → Users**.

---

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Unable to resolve module` after adding a package | Stop the dev server, `rm -rf node_modules && npm install`, then `npx expo start -c` (clears Metro cache). |
| QR code scan hangs on "Downloading JS" | Phone and Mac on different networks. Restart with `npx expo start --tunnel`. |
| `Invalid API key` from Supabase | You pasted the `service_role` key. Use the `anon` key. |
| Phone OTP never arrives | Provider not configured in Supabase → Authentication → Providers → Phone. |
| Price ticker shows `—` | `EXPO_PUBLIC_GOLD_API_URL` unreachable, or device is offline. Check the network tab. |
| KYC upload fails | Storage bucket `kyc-documents` missing, or its RLS policies were not created (re-run `schema.sql`). |
| iOS build fails on M-series with "arch" error | Run once: `sudo arch -x86_64 gem install ffi` — or upgrade CocoaPods to 1.15+. |

---

## 8. Next steps

- Ship a build → [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- Understand the code → [`ARCHITECTURE.md`](./ARCHITECTURE.md)