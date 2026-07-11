# Aurum - Workspace File Explanation Guide

This document explains the purpose and function of the files and directories in the reorganized **Aurum** workspace.

---

## 📂 Workspace Overview

The workspace has been organized into a clear separation of concerns with `backend` and `frontend` folders:

```
App/
├── backend/                        # Backend database configuration & schemas
│   └── supabase/
│       └── schema.sql              # Supabase database schema, tables, and policies
├── frontend/                       # Frontend projects
│   ├── desktop-web/                # Vite + TanStack Start Showcase Website
│   │   ├── src/                    # Source code for the landing page
│   │   └── ... (Vite configs)
│   └── mobile-app/                 # Expo React Native Mobile Client
│       ├── app/                    # Expo Router file-based pages
│       ├── src/                    # Application components, stores, hooks, & helpers
│       └── ... (Expo configs)
├── EXPLANATION.md                  # This file (explaining file functionalities)
└── README.md                       # Workspace quickstart and developer guide
```

---

## 🗄️ 1. Backend: [backend/](file:///c:/Users/asus/Desktop/App/backend)

Contains backend resources, configuration, and database setup files.

### 📄 [backend/supabase/schema.sql](file:///c:/Users/asus/Desktop/App/backend/supabase/schema.sql)
- **Role**: Defines the PostgreSQL database schema, RLS rules, and core backend logic for the Supabase backend.
- **Key Tables**:
  - `settings`: Store configuration, including a kill switch for storefront access control.
  - `referral_codes`: Gated entry invite codes (`AURUM-2026` or `FOUNDER-01`) for sign-up.
  - `profiles`: Customer accounts containing personal details, KYC verification statuses, and referral links.
  - `products`: Jewelry items catalog (Bullion, chains, bangles, rings, pendants, earrings) with weight, purity, and making charges.
  - `addresses`: Shipping addresses linked to users.
  - `orders`: Transactions with weight calculations, billing amounts, order stages (`placed`, `insured_escrow`, `dispatched`, `delivered`), and live shipping updates.
- **Backend Core Functions & Triggers**:
  - `public.handle_new_user()` / `on_auth_user_created`: Automatically creates a record in `public.profiles` upon successful authentication signup in `auth.users`, fetching metadata fields like name and invite code.
  - `public.validate_referral_code()` / `on_profile_referral_check`: Re-validates the referral code on profile inserts/updates to check if it's active. If inactive or invalid, rejects the signup.
  - `public.decrement_product_stock()` / `on_order_placed_decrement_stock`: Validates product stock during order placement and decrements catalog stock quantities accordingly.
  - `public.simulate_order_stage_transition(order_id)`: A testing procedure that advances an order's shipping stages in sequence, enabling developer previews of realtime stage updates.
- **Policies**: Configures Row Level Security (RLS) policies so authenticated users can only access their own profile, orders, and addresses.

---

## 💻 2. Frontend: [frontend/](file:///c:/Users/asus/Desktop/App/frontend)

Contains user-facing applications (Showcase website and Mobile Client).

### 🖥️ A. Showcase Website: [frontend/desktop-web/](file:///c:/Users/asus/Desktop/App/frontend/desktop-web)

A desktop landing page built with **Vite** and **TanStack Start** meta-framework. It hosts an interactive smartphone preview loader that embeds the mobile client inside an iframe.

#### Key Source Files:
- [package.json](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/package.json): Lists Node package dependencies, scripts for development (`npm run dev`), build (`npm run build`), and previewing.
- [vite.config.ts](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/vite.config.ts): Configures Vite and pulls `@lovable.dev/vite-tanstack-config` to enable TanStack Start server/client rendering and TailwindCSS.
- [tsconfig.json](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/tsconfig.json): TypeScript configuration specifying paths and compiler options.
- [eslint.config.js](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/eslint.config.js): Linting configuration rules.
- [src/server.ts](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/server.ts): Custom SSR (Server-Side Rendering) error handler wrapper for Nitro server.
- [src/start.ts](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/start.ts): Start configuration for TanStack Start routing.
- [src/styles.css](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/styles.css): Global CSS containing the theme, layout utilities, and Tailwind inputs.
- [src/router.tsx](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/router.tsx): Initializes the React Router instance for client routing.
- [src/routes/__root.tsx](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/routes/__root.tsx): Main layout component wrapping the website structure (Navbar, container layout, and scripts).
- [src/routes/index.tsx](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/routes/index.tsx): Main landing page. Implements features descriptions, test instructions, and the responsive interactive iframe rendering the mobile preview on port 8081.
- [src/components/ui/](file:///c:/Users/asus/Desktop/App/frontend/desktop-web/src/components/ui): Reusable UI components from Shadcn UI (accordions, buttons, cards, dialogs, sheets, carousel, etc.).

---

### 📱 B. Mobile App: [frontend/mobile-app/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app)

The client application designed for customers. Built with **Expo** (React Native) for deployment on Web, iOS, and Android.

#### 🗂️ App Navigation: [frontend/mobile-app/app/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app)
Expo Router uses file-based routing:
- [_layout.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/_layout.tsx): Handles global initialization, custom fonts (Cormorant Garamond, Inter, JetBrains Mono), state context, and toast notifications.
- [index.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/index.tsx): Gateway entry redirecting the user to login or main application tabs based on authentication state.
- [checkout.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/checkout.tsx): Shopping cart checkout page handling shipping address inputs and Stripe/Razorpay pay simulators.
- [kyc.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/kyc.tsx): Gate requiring PAN/Government ID photo upload if checkout order value exceeds ₹2,00,000.
- [unavailable.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/unavailable.tsx): Displays a maintenance page if storefront storefront_paused setting is true.
- **`(auth)/`** (Authentication route group):
  - [login.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(auth)/login.tsx): Sign-in form requesting user email or phone number.
  - [otp.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(auth)/otp.tsx): OTP entry verification page (mocked to verify with code `123456`).
  - [register.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(auth)/register.tsx): Gated register page requiring referral invite code.
  - [welcome.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(auth)/welcome.tsx): Brand presentation splash screen.
- **`(tabs)/`** (Main navigation route group):
  - [index.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(tabs)/index.tsx): Browse catalog items, categories, and promotions.
  - [search.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(tabs)/search.tsx): Advanced catalog filters.
  - [cart.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(tabs)/cart.tsx): Shopping cart displaying items, quantities, and the 10-minute price-lock countdown.
  - [orders.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(tabs)/orders.tsx): Orders tracker indicating transit phase.
  - [profile.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/(tabs)/profile.tsx): Displays account parameters, current verification status, and log-out actions.
- **`product/` & `order/`** (Dynamic routes):
  - [product/[id].tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/product/%5Bid%5D.tsx): Product details page displaying hallmark certifications, making charges, and dynamic weight selections.
  - [order/[id].tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/app/order/%5Bid%5D.tsx): Order tracking page loading realtime escrow and dispatch updates.

#### 🛠️ Source Assets: [frontend/mobile-app/src/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src)
- [components/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/components): Custom components (like [PriceTicker.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/components/PriceTicker.tsx), [CountdownTimer.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/components/CountdownTimer.tsx), [StageTracker.tsx](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/components/StageTracker.tsx), etc.).
- [hooks/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/hooks): Custom hooks like [useNow.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/hooks/useNow.ts) to manage clock tickers.
- [stores/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/stores): **Zustand** stores managing client-side reactive states:
  - [authStore.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/stores/authStore.ts): Active user profile session.
  - [cartStore.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/stores/cartStore.ts): Shopping cart items and the 10-minute price-lock timer logic.
  - [priceStore.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/stores/priceStore.ts): Active market gold rates per purity grade.
- [theme/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/theme): Defines styling tokens (colors, spacing hierarchy, typography sizes).
- [types/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/types): Defines TypeScript types (`Product`, `Order`, `Profile`, `CartItem`, etc.).
- [lib/](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib): Core SDK integrations:
  - [supabase.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/supabase.ts): Supabase client initialization. Falls back to mock client offline operations if environment variables are missing.
  - [priceApi.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/priceApi.ts): Fetches live spot gold rate feeds (XAU) and currency pairs.
  - [pricing.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/pricing.ts): Calculates standard gold values per purity (24K, 22K, 18K) including making fees and taxes.
  - [orders.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/orders.ts): Orchestrates order state submissions.
  - [notifications.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/notifications.ts): Native device push triggers.
  - [crashReporter.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/crashReporter.ts): Custom diagnostic logging wrapper.
  - [secureStorage.ts](file:///c:/Users/asus/Desktop/App/frontend/mobile-app/src/lib/secureStorage.ts): Encrypted key storage for authentication details.
