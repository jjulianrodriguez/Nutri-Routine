# Design System Actions

This document defines the official action system for buttons and button-like links.

## Official Primitives

- `Button`
  - Base action primitive.
  - Owns variants, sizes, focus, disabled, loading, icon spacing, `asChild`, `data-slot="button"`, and token-based composition.
- `IconButton`
  - Icon-only action wrapper around `Button`.
  - Requires a `label` prop, maps it to `aria-label`, and preserves a title fallback.
- `LinkButton`
  - Navigation action wrapper around `Button`.
  - Uses `next/link` for internal navigation and `<a>` for explicit external actions.
- `ActionButton`
  - Submit/mutation-friendly wrapper around `Button`.
  - Supports `loading`, `loadingLabel`, and a leading or trailing icon without duplicating spinner logic.

## Official Variants

- `default`
- `secondary`
- `outline`
- `ghost`
- `destructive`
- `link`

No module should add one-off button variants locally. If a new action treatment is needed, extend the official primitive contract first.

## Official Sizes

- `xs`
- `sm`
- `default`
- `lg`
- `icon`
- `icon-xs`
- `icon-sm`
- `icon-lg`

Icon-only actions should prefer `IconButton` so labels and touch target expectations are centralized.

## Migrated In This Phase

- Auth submit actions in `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, and `ResetPasswordForm` now use `ActionButton`.
- Password visibility toggle now uses `IconButton`.
- Card actions menu trigger now uses `IconButton`.
- Public header CTA now uses `LinkButton`.
- Existing `Button` consumers remain source-compatible through the same `Button` and `buttonVariants` exports.

## Pending Specific Buttons

These were intentionally left in place because they are domain-specific, public-marketing-specific, or embedded in complex managers where a safe migration needs a smaller follow-up:

- `src/components/Navbar.tsx`: landing navigation uses a separate animated marketing visual language.
- `src/app/page.tsx`: `PremiumLink` is a public landing helper with page-specific variants.
- `src/components/blog/BlogIndex.tsx`: category filters are blog-branded tabs, not generic app actions yet.
- `src/components/theme/theme-toggle.tsx`: switch semantics and sidebar/public theme styling need a dedicated toggle primitive.
- `src/components/app/blog-rich-text-editor.tsx`: toolbar buttons need an editor-toolbar primitive rather than direct replacement.
- `src/components/app/calendar-manager.tsx`: calendar day/event controls need calendar-specific state review before migration.
- `src/components/app/chat-widget.tsx`: chat controls include floating launcher and composer-specific behavior.
- `src/components/app/Sidebar.tsx` and `src/components/app/SidebarNav.tsx`: navigation shell controls need coordinated nav primitive migration.
- `src/components/app/habit-tracker.tsx`, `notification-center.tsx`, `resource-manager.tsx`, `workout-summary-card.tsx`, and `client-activation-form.tsx`: segmented/domain controls need follow-up migrations once tabs, toggles, and menu primitives are stable.

