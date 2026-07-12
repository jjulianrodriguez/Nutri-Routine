# Design System Boolean Controls

This document defines the official boolean control system for checkbox, radio, and switch primitives.

## Official Primitives

- `Checkbox`
  - Base checkbox primitive backed by Radix checkbox semantics.
  - Owns selected, focus, disabled, invalid, size, indicator, and token-based styling.
- `RadioGroup`
  - Radio group root backed by Radix radio group semantics.
  - Owns group state attributes and layout spacing.
- `RadioGroupItem`
  - Base radio option primitive.
  - Owns selected, focus, disabled, invalid, size, indicator, and token-based styling.
- `Switch`
  - Base binary on/off primitive backed by Radix switch semantics.
  - Owns checked, focus, disabled, invalid, size, thumb motion, and token-based styling.

## Shared Infrastructure

- `src/components/ui/boolean-control.ts`
  - Public compatibility export for the folder-based boolean-control implementation.
- `src/components/ui/forms/boolean-control.ts`
  - Centralizes visual recipes for checkbox, radio, switch, switch thumb, and indicators.
  - Uses the existing `defineVariants`, `composeClasses`, `primitiveMotionClasses`, and `primitiveStateClasses` helpers.
  - Uses design-system tokens through Tailwind aliases such as `bg-surface-default`, `border-border-default`, `bg-action-primary`, `ring-focus-ring`, `opacity-disabled`, and `duration-base`.
  - Provides `getBooleanControlStateAttributes` so disabled and invalid state attributes stay consistent.

## Official Sizes

- `sm`
- `default`
- `lg`

These sizes apply consistently to checkbox, radio, and switch. Use `default` unless a surrounding dense or large UI pattern already requires a different size.

## State Contract

Supported states:

- `checked` / `unchecked`
- `disabled`
- `invalid`
- `focus-visible`

Accessibility expectations:

- Prefer visible text labels connected through `Label` or wrapping labels.
- Use `aria-label` only when visible label association is not available.
- Use `invalid` to expose `aria-invalid` and `data-invalid`.
- Keep permission and business rules outside these primitives.

## Migrated In This Phase

- `src/components/app/user-settings-form.tsx`
  - Replaced the local `SwitchRow` track/thumb implementation with the official `Switch`.
  - Preserved the existing settings state updates and disabled behavior.
- `Checkbox`, `RadioGroup`, and `RadioGroupItem` are now implemented under `src/components/ui/forms/` and re-exported from `src/components/ui/checkbox.tsx` and `src/components/ui/radio-group.tsx`.

## Pending Compatible Candidates

These are intentionally left for focused follow-up migrations because they sit inside larger forms or domain managers:

- `src/components/app/blog-manager.tsx`
  - `published` and `isPinned` checkboxes are in a React Hook Form blog manager.
- `src/components/app/professional-profile-form.tsx`
  - Focus-area checkbox list is part of a profile form with validation.
- `src/components/app/routine-editor.tsx`
  - `isActive` checkbox is inside the routine editor workflow.
- `src/components/app/workout-template-editor.tsx`
  - `isActive` checkbox is inside the workout template editor workflow.
- `src/components/app/habit-tracker.tsx`
  - Habit active checkbox is inside a larger nutrition manager; day completion buttons are toggle buttons, not checkbox/radio/switch controls.
- `src/components/app/resource-manager.tsx`
  - Area radio choices are embedded in a complex resource form.

## Not Migrated

- `src/components/theme/theme-toggle.tsx`
  - Uses switch semantics, but has custom theme/icon presentation and public/sidebar styling. It should be reviewed in a dedicated theme-toggle migration.
- `aria-pressed` toolbar, tab, day, and card controls found in app managers.
  - These are toggle buttons or segmented controls, not direct checkbox/radio/switch replacements.
