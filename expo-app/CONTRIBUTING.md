# Contributing

Thanks for helping build Aurum. Keep changes focused and reviewable.

## Ground rules

- Node 20 LTS. Use the pinned version in `.nvmrc`.
- One logical change per PR.
- Never commit real secrets. `.env` is git-ignored; keep sample values in `.env.example`.
- No `console.log` left in shipped code — use a dev-only debug helper.
- Every new table in Supabase needs RLS + GRANTs in the same migration. See `supabase/schema.sql` for the pattern.

## Code style

- TypeScript strict mode; no `any` unless justified in a comment.
- Functional components + hooks only.
- Theme tokens live in `src/theme/`. Do **not** hardcode colors, spacing, or font sizes in components.
- Financial figures render through `src/lib/formatters.ts` — never `.toFixed()` inline.

## PR checklist

- [ ] `npx tsc --noEmit` passes
- [ ] App boots on both iOS and Android (Expo Go is fine)
- [ ] New screens have loading, empty, and error states
- [ ] New tables have RLS + GRANTs + policies
- [ ] Docs (`README.md` / `SETUP.md` / `ARCHITECTURE.md`) updated if behavior changed
- [ ] `CHANGELOG.md` entry under **Unreleased**

## Commit format

Conventional commits, e.g.:

```
feat(cart): warn when price lock expires
fix(auth): retry OTP send on network flake
docs: expand deployment checklist
```