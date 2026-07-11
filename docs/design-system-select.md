# Design System Select

This document records the official Select primitive phase.

## Official Primitive

- `src/components/ui/select.tsx`
  - Exports `Select`, `selectVariants`, `SelectOption`, and `SelectProps`.
  - Uses the phase 2 composition helpers: `defineVariants`, `VariantPropsOf`, and `composeClasses`.
  - Uses native `<select>` semantics so browser keyboard navigation, form participation, disabled behavior, and option announcement remain unchanged.

## Supported API

- `label`
- `placeholder`
- `disabled`
- `invalid`
- `helper`
- `error`
- `size`: `xs`, `sm`, `default`, `lg`
- `variant`: `default`, `outline`, `secondary`, `ghost`
- `icon`
- `options`
- `className`, `containerClassName`, `labelClassName`, `helperClassName`, `errorClassName`

Errors and helper text are automatically connected through `aria-describedby`.
The primitive sets `aria-invalid` when `invalid`, `error`, or an invalid aria
state is provided.

## Migrated In This Phase

- `src/components/app/nutrition-client-selector.tsx`: nutrition assignment client selector.
- `src/components/app/user-settings-form.tsx`: theme, text size, and time format selectors.
- `src/components/app/professional-account-form.tsx`: professional specialty selector.
- `src/components/app/professional-account-manager.tsx`: editable professional specialty selector.
- `src/components/app/personal-details-form.tsx`: personal gender selector.
- `src/components/app/progress-dashboard.tsx`: progress client selector.
- `src/app/app/clientes/page.tsx`: client list filter and sort selectors.
- `src/components/app/nutrition-document-manager.tsx`: meal-plan client selector.
- `src/components/app/client-activation-form.tsx`: admin nutritionist and trainer selectors.

## Special Cases Left In Place

These still contain local `<select>` or `selectClasses` intentionally:

- `src/components/app/exercise-manager.tsx`: mixed filtering plus RHF editing with inactive existing option handling.
- `src/components/app/routine-editor.tsx`: routine builder with selected/inactive exercise compatibility logic.
- `src/components/app/workout-template-editor.tsx`: template editor with day composition state.
- `src/components/app/calendar-manager.tsx`: large calendar/event manager; scheduled for a dedicated split phase.
- `src/components/app/habit-tracker.tsx`: large habit library, assignment, and tracking manager; scheduled for a dedicated split phase.
- `src/components/app/resource-manager.tsx`: explicitly deferred by the roadmap until `ResourceManager` is split.

No business logic, validation schema, server action, route, or database behavior
was changed in this phase.
