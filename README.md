# Aurum — Premium Gold & Jewelry E-Commerce Platform

Aurum is a premium, invite-only e-commerce application designed for purchasing real gold and high-value jewelry pieces calculated against live market gold rates. 

This repository contains two main projects:
1. **Vite + TanStack Start Showcase Website** (Root folder): A desktop presentation landing site for the Aurum brand, featuring a live smartphone device preview loading the mobile app directly.
2. **Expo React Native Mobile App** (`/expo-app`): The mobile client for customers to browse catalog items, check live gold rates, add to cart with a 10-minute price-lock countdown, complete KYC document checks, and securely purchase gold jewelry.

---

## 💎 Project Structure & Quick Start

Both projects run locally and can be tested side-by-side.

### 1. Launch the Mobile Client (Expo)
The mobile app compiles for iOS, Android, and Web using Metro Bundler.
```bash
cd expo-app
npm install
npm run web
```
- Metro will start and host the mobile web version on **[http://localhost:8081](http://localhost:8081)**.

### 2. Launch the Desktop Showcase Website (Vite)
The main website embeds the mobile app inside an interactive phone frame mockup.
```bash
# In the root project directory
npm install
npm run dev
```
- The Vite landing page will run on **[http://localhost:8080](http://localhost:8080)**. Open this link to test the mobile app within a smartphone container mockup!

---

## 🔐 Mock Developer / Testing Mode
To ensure the app can be tested immediately without setting up databases or payment gateways, it runs in **Offline/Mock mode** by default when `.env` keys are unconfigured.

- **Invite-only Registration**: Enter the seed referral invite code:
  `AURUM-2026` or `FOUNDER-01`
- **OTP Login**: Verify any phone number or email instantly with code:
  `123456`
- **Realtime Escrow Stages**: When you place an order, the simulated realtime database will transition your order stage from *Placed* ➜ *Insured Escrow* ➜ *Dispatched* ➜ *Delivered* automatically every 12 seconds so you can watch notifications and tracking details trigger.

---

## 🚀 Key Implemented Features

### 1. Live Gold Rate engine
- Fetches real-time spot gold quotes (XAU) and dynamically pulls live USD-to-INR exchange rates from `open.er-api.com`.
- Automatically derives pure 24K, 22K, and 18K gold rates per gram.

### 2. 10-Minute Cart Price Lock
- Locking prices prevents currency/rate fluctuations during checkout.
- Displays ticking countdown timers in the cart. If the lock expires, the cart automatically re-calculates prices against current market rates and warns the customer.

### 3. High-Value KYC Gate
- Orders >= ₹2,00,000 trigger a regulations check. 
- Integrated native `expo-image-picker` to select documents or capture photos of PAN cards / Government IDs.

### 4. Stripe & Razorpay Payments Simulator
- Interactive checkout Alert prompt to pay via Stripe or Razorpay.
- Includes a loading checkout animation sheet and transaction logging.

---

## 📂 Subdirectories

- [`/expo-app`](./expo-app): The React Native code, routing directories, Zustand stores, and component tokens.
- [`/src`](./src): Root web project routing, layout templates, and Tailwind styling rules.
- [`/public`](./public): Static website assets.
