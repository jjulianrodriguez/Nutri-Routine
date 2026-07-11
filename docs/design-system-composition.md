# Design System Composition Infrastructure

This document describes the shared composition layer for phase 2 primitives. It is additive infrastructure only: it does not migrate pages, managers, routes, or feature modules.

## Files

- `src/components/ui/composition.ts`
  - Re-exports `class-variance-authority` as `defineVariants`.
  - Re-exports `VariantProps` as `VariantPropsOf`.
  - Provides `composeClasses`, the shared class merge function backed by the existing `cn` helper.
- `src/components/ui/contracts.ts`
  - Defines official primitive variant, size, tone, and state vocabulary.
  - Defines reusable prop contracts such as `AsChildProp`, `ClassNameProp`, `PrimitiveStateProps`, `PrimitiveComponentProps`, and `PrimitiveDataAttributes`.
  - Provides `getPrimitiveStateAttributes` for consistent `aria-*` and `data-*` state attributes.
- `src/components/ui/shared-classes.ts`
  - Defines token-based shared class groups for motion, focus, disabled, invalid, selected, loading, surfaces, tones, layout, touch targets, and icon sizes.
  - Uses the phase 1 `--ds-*` Tailwind aliases instead of hardcoded visual values.
- `src/components/ui/boolean-control.ts`
  - Defines the shared checkbox, radio, and switch recipes.
  - Centralizes boolean-control sizes, selected, focus, disabled, invalid, and motion classes.

## Compatibility

Existing primitives remain source-compatible.

- `Button` still exports `Button` and `buttonVariants`.
- `Button` keeps the same variants, sizes, `data-slot`, `data-variant`, and `data-size` behavior.
- `Alert` keeps the same public components and variant behavior.
- No page, manager, domain component, route, token, database table, policy, or business behavior was migrated.

## Next Phase Usage

New low-level primitives should start from these contracts:

1. Define visual recipes with `defineVariants`.
2. Type public variant props with `VariantPropsOf<typeof recipe>`.
3. Merge recipe output and escape-hatch `className` with `composeClasses`.
4. Reuse official vocabulary from `contracts.ts` before adding a new variant, size, tone, or state.
5. Apply shared state classes from `shared-classes.ts` for focus, disabled, invalid, loading, selected, motion, icon sizing, and touch targets.
6. Use `getPrimitiveStateAttributes` when a primitive owns state semantics and needs matching `aria-*` and `data-*` attributes.
7. For checkbox, radio, and switch primitives, reuse the boolean-control recipes instead of defining local track, thumb, indicator, focus, disabled, or invalid classes.

This keeps phase 2 primitives consistent while preserving the existing UI until each primitive is intentionally migrated.
