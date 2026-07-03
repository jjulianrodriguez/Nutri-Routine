# Design System Tokens

This document describes the phase 1 semantic token infrastructure. These tokens are additive and must not be treated as a visual migration by themselves.

## Source Of Truth

Tokens live in `src/app/globals.css`.

- `--ds-*` variables are semantic CSS tokens for direct CSS consumption.
- `@theme inline` exposes safe Tailwind aliases for future primitives.
- Existing legacy tokens such as `--background`, `--surface`, `--primary`, `--radius-card`, and `--shadow-card` remain compatible.

## Token Families

### Spacing

Base scale:

`--ds-space-0`, `--ds-space-0-5`, `--ds-space-1`, `--ds-space-1-5`, `--ds-space-2`, `--ds-space-2-5`, `--ds-space-3`, `--ds-space-3-5`, `--ds-space-4`, `--ds-space-5`, `--ds-space-6`, `--ds-space-7`, `--ds-space-8`, `--ds-space-10`, `--ds-space-12`, `--ds-space-14`, `--ds-space-16`, `--ds-space-20`.

Semantic aliases:

`--ds-space-page-x`, `--ds-space-page-y`, `--ds-space-section`, `--ds-space-stack-xs`, `--ds-space-stack-sm`, `--ds-space-stack-md`, `--ds-space-stack-lg`, `--ds-space-stack-xl`, `--ds-space-inline-xs`, `--ds-space-inline-sm`, `--ds-space-inline-md`, `--ds-space-inline-lg`.

Tailwind aliases include `p-ds-4`, `gap-stack-md`, `px-page-x`, `py-section`, and `gap-inline-md`.

### Radius

`--ds-radius-none`, `--ds-radius-xs`, `--ds-radius-sm`, `--ds-radius-md`, `--ds-radius-lg`, `--ds-radius-xl`, `--ds-radius-card`, `--ds-radius-control`, `--ds-radius-panel`, `--ds-radius-pill`, `--ds-radius-full`.

Tailwind aliases include `rounded-panel` and `rounded-pill` in addition to existing `rounded-card` and `rounded-control`.

### Color Roles

Background and surface:

`--ds-color-bg-canvas`, `--ds-color-bg-surface`, `--ds-color-bg-surface-muted`, `--ds-color-bg-surface-elevated`, `--ds-color-bg-surface-hover`, `--ds-color-bg-inverse`.

Text:

`--ds-color-text-primary`, `--ds-color-text-secondary`, `--ds-color-text-muted`, `--ds-color-text-subtle`, `--ds-color-text-inverse`.

Borders and actions:

`--ds-color-border-default`, `--ds-color-border-subtle`, `--ds-color-border-strong`, `--ds-color-action-primary`, `--ds-color-action-primary-hover`, `--ds-color-action-primary-soft`, `--ds-color-action-primary-text`, `--ds-color-action-secondary`, `--ds-color-action-secondary-hover`, `--ds-color-action-secondary-soft`, `--ds-color-action-secondary-text`.

Tailwind aliases include `bg-canvas`, `bg-surface-default`, `text-text-secondary`, `border-border-default`, `bg-action-primary`, and `text-action-primary-text`.

### Semantic Colors

`--ds-color-status-danger`, `--ds-color-status-danger-surface`, `--ds-color-status-danger-text`, `--ds-color-status-success`, `--ds-color-status-success-surface`, `--ds-color-status-success-text`, `--ds-color-status-warning`, `--ds-color-status-warning-surface`, `--ds-color-status-warning-text`, `--ds-color-status-notice`, `--ds-color-status-notice-surface`, `--ds-color-status-notice-text`.

Tailwind aliases include `bg-status-danger-surface`, `text-status-success-text`, and `border-status-warning`.

### Elevation And Shadows

`--ds-elevation-0`, `--ds-elevation-1`, `--ds-elevation-2`, `--ds-elevation-3`, `--ds-elevation-4`, `--ds-shadow-focus`, `--ds-shadow-glow`, `--ds-shadow-minimal`.

Tailwind aliases include `shadow-elevation-0`, `shadow-elevation-1`, `shadow-elevation-2`, `shadow-elevation-3`, `shadow-elevation-4`, and `shadow-focus-ring`.

### Typography Roles

Fonts:

`--ds-type-display-font`, `--ds-type-heading-font`, `--ds-type-body-font`, `--ds-type-label-font`.

Roles:

`--ds-type-display-*`, `--ds-type-heading-*`, `--ds-type-title-*`, `--ds-type-body-*`, `--ds-type-body-sm-*`, `--ds-type-label-*`, `--ds-type-caption-*`.

Each role may define size, line-height, weight, and tracking. Tailwind aliases include `font-body`, `font-label`, `text-display`, `text-heading`, `text-title`, `text-body`, `text-body-sm`, `text-label`, and `text-caption`.

### Icon Sizes

`--ds-icon-xs`, `--ds-icon-sm`, `--ds-icon-md`, `--ds-icon-lg`, `--ds-icon-xl`, `--ds-icon-2xl`, `--ds-size-touch-target`.

Tailwind aliases include `size-icon-xs`, `size-icon-md`, `size-icon-xl`, and `min-h-touch-target`.

### Transitions And Motion

`--ds-motion-duration-instant`, `--ds-motion-duration-fast`, `--ds-motion-duration-base`, `--ds-motion-duration-slow`, `--ds-motion-duration-slower`, `--ds-motion-ease-standard`, `--ds-motion-ease-enter`, `--ds-motion-ease-exit`, `--ds-motion-enter-y`, `--ds-motion-enter-scale`, `--ds-motion-press-y`.

Tailwind aliases include `duration-fast`, `duration-base`, `duration-slow`, `ease-standard`, `ease-enter`, and `ease-exit`.

### Z-Index

`--ds-z-base`, `--ds-z-raised`, `--ds-z-sticky`, `--ds-z-navigation`, `--ds-z-overlay`, `--ds-z-popover`, `--ds-z-dialog`, `--ds-z-toast`, `--ds-z-skip-link`.

Use these through CSS variables or arbitrary Tailwind values until a primitive layer owns z-index application.

### Focus

`--ds-focus-ring-color`, `--ds-focus-ring-rgb`, `--ds-focus-ring-width`, `--ds-focus-ring-offset`, `--ds-focus-ring-opacity`, `--ds-focus-ring-shadow`.

These preserve the current visible focus behavior and prepare shared primitives to consume one focus contract.

### Overlays

`--ds-overlay-scrim`, `--ds-overlay-scrim-soft`, `--ds-overlay-surface`, `--ds-overlay-backdrop-blur`.

Dark mode overrides the scrim tokens for stronger separation.

### Opacity And Disabled State

`--ds-opacity-hidden`, `--ds-opacity-muted`, `--ds-opacity-subtle`, `--ds-opacity-disabled`, `--ds-opacity-visible`, `--ds-disabled-opacity`, `--ds-disabled-cursor`, `--ds-disabled-pointer-events`.

Tailwind aliases include `opacity-muted`, `opacity-subtle`, and `opacity-disabled`.

## Next Phase Usage

The next phase should use these tokens when building low-level primitives:

- Buttons and links: action colors, control radius, focus, motion, disabled, icon sizes.
- Inputs and form fields: surface roles, border roles, focus, disabled, spacing, typography labels.
- Cards and panels: surface roles, radius roles, elevation roles, stack spacing.
- Dialogs, popovers, drawers, and toasts: overlay, z-index, elevation, focus, motion.
- Badges and alerts: semantic status colors.

Do not migrate existing pages or managers until the primitive APIs are stable.
