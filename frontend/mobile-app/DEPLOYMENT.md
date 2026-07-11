# Deployment

How to ship Aurum to the App Store, Play Store, and OTA channels using **EAS (Expo Application Services)**.

---

## 1. One-time setup

### Install the EAS CLI

```bash
npm install -g eas-cli
eas login          # uses your Expo account
```

### Link the project

From `expo-app/`:

```bash
eas init           # creates the project on expo.dev and writes the projectId into app.json
```

### Configure builds

An [`eas.json`](./eas.json) is committed with three profiles:

| Profile | Purpose | Distribution |
| --- | --- | --- |
| `development` | Dev-client build for on-device debugging | internal |
| `preview` | Internal QA build (APK for Android, ad-hoc IPA for iOS) | internal |
| `production` | Store-ready builds | store |

### Store credentials

- **Apple**: An Apple Developer account ($99/yr). EAS can manage certificates automatically the first time you run `eas build -p ios --profile production` — accept the prompt.
- **Google Play**: A Play Console account ($25 once). Create a service-account JSON in Google Cloud (role: *Service Account User* + *Release manager* in Play Console) and save it as `google-play-service-account.json` (git-ignored). Referenced from `eas.json` → `submit.production.android.serviceAccountKeyPath`.

---

## 2. Environment / secrets in production

Public config (safe to bake into the bundle) — set as **EAS build-time env vars**:

```bash
eas env:create production EXPO_PUBLIC_SUPABASE_URL         https://xxxx.supabase.co
eas env:create production EXPO_PUBLIC_SUPABASE_ANON_KEY    eyJhbGci...
eas env:create production EXPO_PUBLIC_GOLD_API_URL         https://api.gold-api.com/price/XAU
eas env:create production EXPO_PUBLIC_USD_INR              83.5
eas env:create production EXPO_PUBLIC_MIN_ORDER_WEIGHT_G   100
eas env:create production EXPO_PUBLIC_KYC_THRESHOLD_INR    200000
eas env:create production EXPO_PUBLIC_GST_PERCENT          3
eas env:create production EXPO_PUBLIC_PRICE_LOCK_MINUTES   10
```

Repeat with `preview` for the QA channel. Private secrets (Razorpay/Stripe secret keys, webhook signing keys) must **not** be `EXPO_PUBLIC_*` — keep them server-side in a Supabase Edge Function and read via HTTPS from the app.

---

## 3. Build

```bash
# Android AAB for Play Store
eas build --platform android --profile production

# iOS IPA for App Store
eas build --platform ios --profile production

# Both
eas build --platform all --profile production
```

Builds run on Expo's cloud infra. Progress is streamed; the finished artifact URL appears in the terminal and at https://expo.dev.

---

## 4. Submit to stores

```bash
eas submit --platform android --profile production --latest
eas submit --platform ios     --profile production --latest
```

- **iOS**: Requires App Store Connect app record. `eas submit` walks you through creating it.
- **Android**: First submission must be uploaded manually via Play Console (Google's rule). Subsequent builds submit automatically.

---

## 5. Over-the-air (OTA) JS updates

For JS-only changes (no native modules, no `app.json` config changes), push updates without a store review:

```bash
eas update --branch production --message "Fix price-lock countdown flicker"
```

The next time a user opens the app, the new JS bundle downloads in the background. Configure channels in `eas.json` → `build.<profile>.channel`.

> Any change that touches native modules, permissions, `app.json` plugins, or the Expo SDK requires a full rebuild + store submission.

---

## 6. Production Supabase checklist

Before flipping the switch on paying customers:

- [ ] Custom SMTP configured (Auth → SMTP) — Supabase's shared SMTP is rate-limited.
- [ ] Phone provider credentials (Twilio/MessageBird) added and tested.
- [ ] `settings.storefront_paused` defaults to `false`.
- [ ] RLS enabled on **every** table (verify in Table Editor — no red "unrestricted" badges).
- [ ] `kyc-documents` bucket is **private** and its policies restrict reads to the owner + `admin` role.
- [ ] Daily backups enabled (Project Settings → Database → Backups).
- [ ] Point-in-time recovery on for paid tiers.
- [ ] At least one `admin` user seeded (`insert into user_roles ...`).
- [ ] `referral_codes` seeded with real distribution codes.
- [ ] Rate-limit rules configured (Project Settings → API → Rate limits).

---

## 7. Monitoring

- **Crash / error reporting**: install `sentry-expo` and add `SENTRY_DSN` (private, via `eas secret:create`, read at build time).
- **Analytics**: Expo's built-in `expo-analytics` or PostHog React Native.
- **Backend logs**: Supabase → Logs Explorer.
- **Uptime**: point BetterStack / UptimeRobot at the Supabase REST endpoint and the gold-price API.

---

## 8. Rollback

```bash
# Roll a bad OTA update back to the previous bundle
eas update:republish --branch production --group <previous-group-id>

# Full binary rollback: promote the previous store build back to production
# in App Store Connect / Play Console.
```

---

## 9. Release checklist

- [ ] `CHANGELOG.md` updated
- [ ] `version` bumped in `app.json`
- [ ] `ios.buildNumber` and `android.versionCode` bumped
- [ ] Screenshots + store listing text updated
- [ ] Smoke-tested on a real device on cellular network (price ticker latency)
- [ ] Kill-switch verified by toggling `settings.storefront_paused = true` and confirming checkout blocks