# Design System IconButton

This document records the official separation of `IconButton` from `Button`.

## Relationship With Button

`IconButton` is a wrapper around `Button`, not a parallel button system.

- `Button` owns variants, sizes, token classes, disabled behavior, loading spinner, focus styles, and state attributes.
- `IconButton` owns icon-only accessibility, touch target enforcement, optional tooltip composition, and icon-only loading presentation.
- `button-core.tsx` is the shared implementation layer.
- `button.tsx` remains a compatibility export surface for existing imports.

## API

```tsx
<IconButton
 type="button"
 label="Editar recurso"
 variant="ghost"
 size="icon-sm"
 tooltip="Editar"
 loading={isPending}
 loadingLabel="Editando recurso"
>
 <Pencil aria-hidden="true" />
</IconButton>
```

Required:

- `label`
- `children`

Supported:

- `variant`: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`
- `size`: `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- `loading`
- `loadingLabel`
- `tooltip`
- `tooltipSide`
- `tooltipAlign`
- `tooltipClassName`
- `disabled`
- `asChild`
- native button and ARIA state props such as `aria-controls`, `aria-expanded`, and `aria-pressed`

`aria-label` is not accepted directly. The required `label` prop is the official accessible-name API for icon-only actions.

## State Contract

Supported states:

- idle
- hover
- active
- focus-visible
- disabled
- loading
- destructive
- expanded
- pressed

Loading uses the shared `Button` spinner and disables the action. `IconButton` hides its icon while loading so the control stays icon-only instead of rendering an icon plus spinner.

## Later Migration Candidates

Do not migrate these as part of the separation. They can move in focused follow-up tasks:

- `src/components/Navbar.tsx`
- `src/components/theme/theme-toggle.tsx`
- `src/components/blog/BlogIndex.tsx`
- `src/components/app/blog-rich-text-editor.tsx`
- `src/components/app/calendar-manager.tsx`
- `src/components/app/chat-widget.tsx`
- `src/components/app/habit-tracker.tsx`
- `src/components/app/notification-center.tsx`
- `src/components/app/resource-manager.tsx`
- `src/components/app/Sidebar.tsx`
- `src/components/app/SidebarNav.tsx`
- `src/components/app/workout-summary-card.tsx`
- `src/components/app/client-activation-form.tsx`

No application behavior, permissions, database schema, or route behavior changed in this phase.
