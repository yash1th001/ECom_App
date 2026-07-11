# Aurum — Premium Gold & Jewelry E-Commerce Platform

Aurum is a premium, invite-only e-commerce application designed for purchasing real gold and high-value jewelry pieces calculated against live market gold rates.

This repository is organized into a modular workspace containing the frontend client apps and the backend database schema.

---

## 📂 Project Structure

- **[backend/](file:///c:/Users/asus/Desktop/App/backend)**: Contains database schemas and setups.
  - [supabase/schema.sql](file:///c:/Users/asus/Desktop/App/backend/supabase/schema.sql): PostgreSQL tables, RLS policies, indexes, and initial seeds.
- **[frontend/](file:///c:/Users/asus/Desktop/App/frontend)**: Contains user-facing client projects.
  - [desktop-web/](file:///c:/Users/asus/Desktop/App/frontend/desktop-web): A Vite + TanStack Start landing page with an interactive smartphone mockup framing the mobile client.
  - [mobile-app/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app): An Expo React Native application supporting web previews, iOS, and Android compiles.

For a detailed explanation of each file and folder and their respective functions, refer to the **[EXPLANATION.md](file:///c:/Users/asus/Desktop/App/EXPLANATION.md)** guide.

---

## 💎 Quick Start Guide

You can run both projects locally side-by-side:

### 1. Launch the Mobile Client (Expo)
The mobile app compiles for Web, iOS, and Android.
```bash
cd frontend/mobile-app
npm install
npm run web
```
- Metro will bundle the app and host the mobile web version on **[http://localhost:8081](http://localhost:8081)**.

### 2. Launch the Desktop Showcase Website (Vite + TanStack Start)
The main website embeds the mobile app inside an interactive phone frame mockup.
```bash
cd frontend/desktop-web
npm install
npm run dev
```
- The Vite landing page will run on **[http://localhost:8080](http://localhost:8080)**. Open this link in your browser to test the mobile app running within the smartphone container mockup!

---

## 🔐 Mock Developer / Testing Mode
To ensure the app can be tested immediately without setting up databases or payment gateways, it runs in **Offline/Mock mode** by default when `.env` keys are unconfigured.

- **Invite-only Registration**: Enter the seed referral invite code:
  `AURUM-2026` or `FOUNDER-01`
- **OTP Login**: Verify any phone number or email instantly with code:
  `123456`
- **Realtime Escrow Stages**: When you place an order, the simulated database transitions the order stage from *Placed* ➜ *Insured Escrow* ➜ *Dispatched* ➜ *Delivered* automatically every 12 seconds so you can watch status changes and notifications trigger.
