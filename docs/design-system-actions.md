# Design System Actions

This document defines the official action system for buttons and button-like links.

## Official Primitives

- `Button`
  - Base action primitive.
  - Owns variants, sizes, focus, disabled, loading, icon spacing, `asChild`, `data-slot="button"`, and token-based composition.
- `IconButton`
  - Official icon-only action primitive exported from `src/components/ui/icon-button.tsx`.
  - Composes `Button` through the shared `button-core` infrastructure instead of duplicating variants, sizes, loading, focus, disabled, or token logic.
  - Requires a `label` prop, maps it to `aria-label`, and preserves a title fallback when no explicit tooltip is rendered.
  - Supports an optional `tooltip` prop for visible hover/focus help text.
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

## IconButton API

Use `IconButton` for controls whose visible content is only an icon.

```tsx
<IconButton
 type="button"
 label="Eliminar rutina"
 variant="destructive"
 tooltip="Eliminar"
 loading={isDeleting}
 loadingLabel="Eliminando rutina"
>
 <Trash2 aria-hidden="true" />
</IconButton>
```

Supported props:

- `label`: required accessible name, mapped to `aria-label`.
- `children`: required icon content.
- `variant`: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
- `size`: `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
- `loading`: disables the action through `Button`, exposes busy/loading attributes, and shows the shared spinner without visible text.
- `loadingLabel`: optional accessible label while loading. It is not rendered as visible text, so the control remains icon-only.
- `tooltip`: optional visible tooltip content.
- `tooltipSide`, `tooltipAlign`, `tooltipClassName`: optional tooltip placement and styling escape hatches.
- `asChild`: available through `Button` for link-like icon actions when a semantic child such as `Link` or `a` is required.
- Native button props such as `disabled`, `type`, `aria-controls`, `aria-expanded`, `aria-pressed`, and event handlers.

`aria-label` is intentionally not part of the public API. Callers must use `label` so icon-only accessibility can be reviewed consistently.

## IconButton State Contract

Supported states are inherited from `Button`:

- idle
- hover
- active
- focus-visible
- disabled
- loading
- destructive treatment
- expanded or pressed states when callers pass `aria-expanded` or `aria-pressed`

`IconButton` also enforces the shared touch target by applying `primitiveLayoutClasses.touchTarget` on top of the icon size recipe.

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

## Current IconButton Separation

- `src/components/ui/button-core.tsx` owns `Button`, `buttonVariants`, `ActionButton`, and `LinkButton`.
- `src/components/ui/icon-button.tsx` owns `IconButton` and composes `Button`.
- `src/components/ui/button.tsx` remains a compatibility export surface so existing imports keep working.
- No app, auth, blog, manager, route, database, auth, or permission behavior was migrated in this separation.
