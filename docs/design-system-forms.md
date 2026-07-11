# Design System Forms

This document records the official form primitive phase.

## Official Primitives

- `src/components/ui/form-field.tsx`
  - Exports `FormField`, `FormControl`, `FieldLabel`, `FieldHint`, `FieldError`, `RequiredIndicator`, `FormAlert`, and `FieldGroup`.
  - `FormField` owns the shared field structure: label, control, hint, error, and required indicator.
  - `FormControl` connects controls to hint and error text through `aria-describedby`.
  - `FieldError` keeps the existing inline error behavior: it renders nothing without content and uses `role="alert"` when shown.
  - `FormAlert` provides the official form-level feedback surface for danger, success, and notice messages.

## Migrated In This Phase

Local `FieldError` implementations were removed from:

- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/reset-password-form.tsx`
- `src/components/app/basic-account-form.tsx`
- `src/components/app/password-change-form.tsx`
- `src/components/app/professional-account-form.tsx`
- `src/components/app/professional-account-manager.tsx`
- `src/components/app/professional-profile-form.tsx`
- `src/components/app/personal-details-form.tsx`
- `src/components/app/blog-manager.tsx`
- `src/components/app/routine-editor.tsx`
- `src/components/app/workout-template-editor.tsx`
- `src/components/app/calendar-manager.tsx`
- `src/components/app/exercise-manager.tsx`
- `src/components/app/nutrition-document-manager.tsx`
- `src/components/app/resource-manager.tsx`

The inline recovery email error in `src/components/auth/forgot-password-form.tsx` was migrated to `FormField`.

## Pending Form Migrations

These forms still use manual label, helper, alert, or group composition and should be migrated only in dedicated follow-up phases:

- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/reset-password-form.tsx`
- `src/components/app/basic-account-form.tsx`
- `src/components/app/password-change-form.tsx`
- `src/components/app/professional-account-form.tsx`
- `src/components/app/professional-account-manager.tsx`
- `src/components/app/professional-profile-form.tsx`
- `src/components/app/personal-details-form.tsx`
- `src/components/app/blog-manager.tsx`
- `src/components/app/routine-editor.tsx`
- `src/components/app/workout-template-editor.tsx`
- `src/components/app/calendar-manager.tsx`
- `src/components/app/exercise-manager.tsx`
- `src/components/app/nutrition-document-manager.tsx`
- `src/components/app/resource-manager.tsx`

Special care is required for managers that contain field arrays, dynamic IDs, file validation, inactive existing options, rich text editors, or local non-RHF field error maps.

No validation schema, server action, route, database table, policy, or business behavior was changed in this phase.
