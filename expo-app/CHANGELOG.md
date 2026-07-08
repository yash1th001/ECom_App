# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- `SETUP.md`, `DEPLOYMENT.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `LICENSE`, `eas.json`, `.nvmrc`, `.editorconfig` for a full local + release workflow.

## [0.1.0] — 2026-07-08

### Added
- Initial Expo scaffold: auth (referral-gated), catalog, cart with 10-minute price lock, checkout with KYC gate, realtime order tracker, kill-switch.
- Live gold-price ticker polling `api.gold-api.com` every 15 s.
- Supabase schema with RLS, `user_roles`, seed data.