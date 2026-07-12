# Design System SearchField

This document records the official SearchField primitive phase.

## Official Primitive

- `src/components/ui/forms/search-field.tsx`
  - Exports `SearchField`, `searchFieldInputVariants`, and `SearchFieldProps`.
  - Owns search-specific composition: leading icon, clear action, loading indicator, disabled/read-only/invalid states, sizes, variants, labels, helper text, errors, and accessible descriptions.
  - Supports controlled and initial uncontrolled values while keeping native `type="search"` form participation.
  - Supports optional `debounceMs` through `onValueChange`; native `onChange` remains immediate for compatibility.
- `src/components/ui/forms/input.tsx`
  - Keeps `SearchInput` as a typed input compatibility primitive built from `Input`.
  - Re-exports `SearchField` from the official file so older import paths do not create a second implementation.
- `src/components/ui/search-field.tsx` and `src/components/ui/input.tsx`
  - Public compatibility exports for the same implementation files above.

## Supported API

- `label`
- `helper`
- `error`
- `icon`
- `clearable`
- `clearLabel`
- `loading`
- `disabled`
- `readOnly`
- `invalid`
- `debounceMs`
- `onValueChange`
- `onClear`
- `size`: `sm`, `default`, `lg`
- `variant`: `default`, `outline`, `secondary`, `ghost`
- `className`, `containerClassName`, `controlClassName`, `labelClassName`, `helperClassName`, `errorClassName`

Errors and helper text are automatically connected through `aria-describedby`.
The primitive sets `aria-invalid` when `invalid`, `error`, or an invalid aria
state is provided. Loading state is exposed with `aria-busy`.

## Migrated In This Phase

- `src/app/app/clientes/page.tsx`: client list text search.
- `src/components/app/exercise-manager.tsx`: exercise library text search.
- `src/components/app/resource-manager.tsx`: resource library text search.
- `src/components/app/assignment-entity-selector.tsx`: shared assignment selector search used by:
  - `src/components/app/routine-assignment-form.tsx`: client and workout template search.
  - `src/components/app/routine-editor.tsx`: exercise search.
  - `src/components/app/workout-template-editor.tsx`: routine search.

No search filter logic, URL parameter names, route behavior, server action,
database table, policy, or validation schema was changed in this phase.

## Exceptions

- `SearchField` is the official public API for composed search UI.
- `SearchInput` remains official only as a typed `Input` compatibility primitive for simple native search inputs. It does not own a second search-field implementation or a separate style recipe.
- `src/app/app/calendario/loading.tsx`, `src/app/app/clientes/loading.tsx`, `src/app/app/recursos/loading.tsx`, and `src/app/app/progreso/loading.tsx`: `SearchFilterSkeleton` usage is a loading placeholder, not an interactive search field.
- Nutrition and progress modules currently expose selectors and tab/filter URL state, but no safe repeated free-text search field was found to migrate in this phase.
- Complex filter selects in `exercise-manager`, `resource-manager`, and client listing were intentionally left unchanged because the task only covered search-field infrastructure.
- Text inputs in managers and forms were left unchanged when they capture entity data rather than perform search.
