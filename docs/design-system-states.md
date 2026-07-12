# Design System States

This document records the official state primitive phase. The current phase publishes the official state components and migrates only compatible UI composition. No route fetch path, server action, database table, policy, permission rule, or business logic was changed.

## File Tree Created Or Updated

- `src/components/ui/feedback/state-block.tsx`
  - Official state composition primitive and semantic wrappers.
- `src/components/ui/state-block.tsx`
  - Compatibility re-export for the official state primitives.
- `src/components/ui/feedback/skeleton.tsx`
  - Existing skeleton compatibility exports preserved.
  - Publishes `SkeletonBlock`, `ListSkeleton`, `CardSkeleton`, `GridSkeleton`, and `PageSkeleton`.
- `src/components/ui/skeleton.tsx`
  - Compatibility re-export for the official skeleton primitives.
- `docs/design-system-states.md`
  - This phase contract and API reference.

## Official State Primitives

### `StateBlock`

`StateBlock` is the base composition primitive for reusable empty, error, permission, offline, success, warning, maintenance, and loading surfaces.

Responsibilities:

- Own generic state layout: icon, eyebrow, title, description, content, and actions.
- Own state semantics through `role`, `aria-live`, `aria-busy`, `data-slot`, `data-variant`, and `data-size`.
- Own official visual variants.
- Keep domain copy, permissions, routing, fetching, and mutations outside the primitive.

API:

- `variant`: `empty`, `error`, `warning`, `success`, `no-results`, `no-permission`, `offline`, `maintenance`, `loading`.
- `size`: `sm`, `default`, `lg`.
- `align`: `start`, `center`.
- `eyebrow`: optional small label.
- `title`: optional heading content.
- `description`: optional supporting copy.
- `children`: optional extra body content.
- `icon`: optional custom icon. Use `false` to hide the icon.
- `actions`: optional action slot.
- `className`: scoped escape hatch.
- Native `section` props except native `title`.

Default semantics:

- `error` and `offline` use `role="alert"`.
- `loading` and `success` use `role="status"`.
- Other variants use `role="region"`.
- `loading` sets `aria-live="polite"` and `aria-busy`.

### `EmptyState`

`EmptyState` composes `StateBlock` for absence states.

Supported variants:

- `empty`
- `no-results`
- `no-permission`
- `offline`

It defaults to `variant="empty"`. Children-only calls render a compact compatible block; callers should pass domain-specific `title`, `description`, and `actions` when the empty state explains a real workflow.

### `ErrorState`

`ErrorState` composes `StateBlock` for recoverable failure states.

Supported variants:

- `error`
- `warning`
- `no-permission`
- `offline`
- `maintenance`

Additional API:

- `retryLabel`: optional visible label for a standard retry action.
- `retryProps`: props passed to the retry `Button`, except `children` and `variant`.
- `actions`: optional additional recovery actions.

Security note: this component only renders recovery UI. Permission checks and ownership validation must remain in the secure server/database layer.

### `LoadingState`

`LoadingState` composes `StateBlock` with `variant="loading"`.

API:

- Inherits `StateBlock` composition props except `variant`.
- `label`: optional helper copy mapped to `description` when `description` is not provided.
- Defaults to a generic loading title and an animated spinner icon.

Use `LoadingState` for inline or block-level status messaging. Use skeletons for layout-preserving placeholders.

## Official Skeleton Primitives

### `SkeletonBlock`

`SkeletonBlock` is the base skeleton primitive. `Skeleton` now delegates to it as a compatibility wrapper.

API:

- `shape`: `avatar`, `block`, `control`, `media`, `text`.
- `animated`: `true` or `false`.
- `decorative`: defaults to `true`, which sets `aria-hidden`.
- `className`: required for width/height/aspect-ratio at the call site.
- Native `div` props.

Responsibilities:

- Own the common pulse treatment and shape radius.
- Keep dimensions explicit at the call site to prevent layout shift.
- Avoid domain-specific loading structure.

### Reusable Skeleton Patterns

- `ListSkeleton`
  - Props: `rows`, `avatar`, `action`, `className`.
  - Composes existing `ListRowSkeleton`.
- `CardSkeleton`
  - Props: `avatar`, `action`, `media`, `className`.
  - Composes `SkeletonBlock`.
- `GridSkeleton`
  - Props: `cards`, `columns`, plus `CardSkeleton` props.
  - Supported `columns`: `responsive`, `two`, `three`, `four`.
  - Composes `CardSkeleton`.
- `FormSkeleton`
  - Existing official export preserved.
  - Props: `fields`, `textarea`.
  - Uses `Skeleton`, which now delegates to `SkeletonBlock`.
- `PageSkeleton`
  - Props: `navItems`, `stats`, `sections`, `className`.
  - Composes existing page/header/stat/panel skeletons.

Existing compatibility skeletons remain exported:

- `Skeleton`
- `SkeletonTextStack`
- `PageHeaderSkeleton`
- `SectionNavSkeleton`
- `StatTileSkeleton`
- `ButtonRowSkeleton`
- `SearchFilterSkeleton`
- `PanelHeaderSkeleton`
- `AppPanelSkeleton`
- `ListRowSkeleton`
- `CardGridSkeleton`

## Components Reused

- `ErrorState` reuses the official `Button` for the optional retry action.
- `EmptyState`, `ErrorState`, and `LoadingState` all reuse `StateBlock`.
- `Skeleton` reuses `SkeletonBlock`.
- `ListSkeleton`, `GridSkeleton`, and `PageSkeleton` reuse existing skeleton building blocks where compatible.

## Compatible Migrations Completed

- Removed the local `EmptyState` export from `AppScreen`; compatible consumers now import the official `EmptyState`.
- Removed `ProgressEmptyState`; progress empty states now use `EmptyState`.
- Removed the local progress `BlockError`; compatible progress alerts now use compact `ErrorState`.
- Removed `TrainingLoadingState`; training `loading.tsx` files now compose official skeleton primitives directly.
- Removed `ChatLoadingState`; the chat loading surface now composes `SkeletonBlock` directly.

## Design Decisions

- The new primitives live in `src/components/ui` because they are low-level Design System infrastructure with no domain knowledge.
- Only compatible local app states were migrated in this phase to avoid behavior changes and broad review risk.
- State variants are semantic, not visual. Callers choose `no-permission` or `offline` instead of a color name.
- Actions are slots instead of boolean props so callers can compose links, buttons, or recovery blocks without the primitive knowing routing or mutations.
- Skeleton dimensions stay explicit through `className` to keep layout ownership near the consuming layout.
- The old `Skeleton` export remains source-compatible while the official base becomes `SkeletonBlock`.
