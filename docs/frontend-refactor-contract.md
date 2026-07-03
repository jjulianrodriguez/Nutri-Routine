# Frontend Refactor Contract

This document is the technical contract for the frontend refactor. It is binding for all refactor work until it is explicitly replaced by a newer contract.

The goal is to make the application easier to maintain, safer to extend, and visually consistent through shared primitives, shared layouts, shared hooks, and domain-owned components. This contract does not implement the Design System. It defines the rules that every future implementation must follow.

## 1. Objectives

The refactor must:

- Make the application feel and behave like one coherent product.
- Reduce duplicate UI implementations.
- Reduce duplicate form, feedback, confirmation, filtering, and layout logic.
- Define stable ownership between low-level UI, app-level shared patterns, and domain components.
- Preserve all existing business behavior during migration.
- Preserve the current visual direction unless a later task explicitly changes it.
- Keep Server Component and Client Component boundaries intentional.
- Make future features cheaper to build by reusing official primitives and patterns.
- Make reviews easier by giving reviewers a clear contract to enforce.

The refactor must not:

- Create arbitrary new variants.
- Create duplicate components for the same role.
- Redesign unrelated pages.
- Change business behavior while migrating UI architecture.
- Move files broadly before shared APIs are stable.
- Add dependencies unless a task proves they are necessary.
- Hide security or permission logic in the frontend.

## 2. Scope

In scope:

- Components under `src/components`.
- App route UI composition under `src/app`.
- Frontend hooks under `src/hooks`.
- UI helpers under `src/lib` when they support frontend presentation, formatting, filtering, state mapping, or action feedback.
- Design System primitives.
- Shared app patterns.
- Domain component boundaries.
- Layout composition.
- PR review criteria for frontend refactor work.

Out of scope unless explicitly requested:

- Database schema changes.
- Supabase RLS changes.
- Auth role changes.
- Route renames.
- Business logic redesign.
- Global branding changes.
- Global typography changes.
- New feature work unrelated to refactor migration.
- Dependency installation.

## 3. Source Of Truth Order

When deciding how to implement a refactor, use this order:

1. `AGENTS.md`.
2. This contract.
3. Web Interface Guidelines.
4. Existing project patterns.
5. Next.js App Router conventions.
6. Domain-specific requirements from the task.

If these conflict, do not guess silently. Use the stricter rule unless it would break existing behavior, then document the tradeoff in the PR.

## 4. Naming Rules

Use names that describe responsibility, not implementation detail.

Allowed naming patterns:

- Primitives: `Button`, `IconButton`, `Input`, `Select`, `FormField`, `StatusBadge`.
- App shared patterns: `EntityCard`, `FilterBar`, `SectionTabs`, `SettingsRow`, `ManagementPageLayout`.
- Domain components: `RoutineCard`, `ResourceLibrary`, `CalendarGrid`, `ClientDetailHeader`.
- Hooks: `useConfirmAction`, `useUrlFilters`, `useServerActionFeedback`.
- Helpers: `formatDate`, `getStatusTone`, `mapFieldErrorsToForm`.

Avoid:

- Vague names such as `Manager`, `Wrapper`, `Container`, `Box`, `Thing`, `Custom`.
- Names based only on styling, such as `BlueCard`, `BigButton`, `PrettyInput`.
- Names that hide a domain concept.
- Names that use two terms for the same concept unless a migration alias is documented.

Temporary names:

- Temporary compatibility wrappers may use `Legacy` only when they preserve an old API.
- `Legacy` components must have a removal condition in the migration notes.
- Do not create `NewButton`, `NewCard`, or versioned names like `ButtonV2` unless there is a documented migration bridge.

## 5. Criteria For Creating A New Component

Create a new component only when at least one condition is true:

- The pattern is used in at least two places now.
- The pattern is expected to be used by at least two domains in the current roadmap.
- The component centralizes accessibility, focus, keyboard, loading, or error behavior.
- The component prevents repeated styling or repeated structural markup.
- The component creates a clear boundary between presentation and business logic.
- The component improves testability or reviewability without hiding important behavior.

Do not create a new component when:

- It is only a thin wrapper around one element and adds no behavior, semantics, or consistency.
- It only exists to avoid writing a short class list once.
- It makes the call site harder to read.
- It mixes unrelated responsibilities.
- It introduces a custom API that does not match similar components.
- It represents a one-off visual case that should remain local.

Every new shared component must answer:

- What existing component was checked first?
- Why can the existing component not be extended safely?
- Which layer owns this component: `ui`, `app/shared`, or `app/domains`?
- What variants are official?
- What states are supported?
- What accessibility requirements does it own?

## 6. Reuse Rules

Before creating anything:

1. Search for an existing primitive in `src/components/ui`.
2. Search for an app-level pattern in `src/components/app`.
3. Search for a domain component in the relevant feature area.
4. Search for existing hooks and helpers.
5. Prefer extension through official variants or composition.
6. Create a new shared component only if reuse would create worse coupling.

If two components do the same job, the refactor must converge them into one official API instead of keeping both.

If a component is almost reusable but has an API gap, prefer improving the official component over creating a parallel one.

## 7. Target Folder Structure

This is the target architecture. It should be reached gradually. Do not reorganize folders until the migration reaches the folder migration phase.

- `src/components/ui`
  - Official low-level Design System primitives.
  - No business domain knowledge.
  - No imports from `src/components/app/domains`.
  - No imports from server actions.

- `src/components/app/shared`
  - Reusable SaaS/product patterns built from `ui`.
  - May know app concepts such as entity cards, settings rows, filters, app navigation, upload UI, and management page patterns.
  - Must not know a specific business domain unless the abstraction is intentionally generic.

- `src/components/app/domains`
  - Domain-owned components for clients, training, nutrition, resources, calendar, messaging, blog, progress, settings, and profile.
  - May compose `ui` and `app/shared`.
  - May know domain types and domain copy.

- `src/components/auth`
  - Auth-specific components and auth forms.
  - May use `ui` primitives.
  - Must not depend on app-only domain components.

- `src/components/blog` or public content area
  - Public-facing blog components.
  - May use `ui` primitives when compatible.
  - Should not force public marketing needs into internal app primitives.

- `src/hooks`
  - Reusable client hooks.
  - Must not contain domain server access.

- `src/lib`
  - Server data, actions, validation, formatting, and pure helpers.
  - Frontend helpers may live in a clear subfolder if the project creates one during migration.

## 8. Ownership Rules

### `ui`

Owns:

- Visual and semantic primitives.
- Accessibility behavior that belongs to base controls.
- Variant contracts.
- Low-level interaction states.

Must not own:

- Domain text.
- Domain data fetching.
- Server actions.
- Supabase access.
- Business decisions.

### `app/shared`

Owns:

- Product-level reusable patterns.
- Generic entity display.
- Generic filtering/search composition.
- Generic page sections.
- Generic app feedback patterns.

Must not own:

- Domain-specific mutations.
- Domain-specific validation schemas.
- Domain-specific permission decisions.

### `app/domains`

Owns:

- Domain workflows.
- Domain cards and lists.
- Domain forms.
- Domain labels and copy.
- Domain-specific composition.

Must not own:

- New button variants.
- New input styles.
- New modal infrastructure.
- New generic dropdown APIs.
- Repeated primitives already available elsewhere.

## 9. Primitive Rules

Primitives must:

- Be reusable across domains.
- Have a small, explicit API.
- Support required accessibility behavior by default.
- Provide only official variants.
- Use semantic names for variants.
- Keep styling centralized.
- Avoid domain copy.
- Prefer composition over many boolean props.
- Preserve `className` escape hatches only when needed and not as the main API.

Primitives must not:

- Encode domain-specific business logic.
- Fetch data.
- Call server actions.
- Own routing decisions except link primitives.
- Add arbitrary style variants for one screen.
- Accept many unrelated booleans that create unclear combinations.

Official primitive candidates:

- `Button`
- `IconButton`
- `LinkButton`
- `Input`
- `PasswordInput`
- `SearchField`
- `Textarea`
- `Select`
- `Checkbox`
- `Radio`
- `Switch`
- `FormField`
- `FieldLabel`
- `FieldHint`
- `FieldError`
- `FormAlert`
- `Card`
- `NestedCard`
- `AppPanel`
- `StatusBadge`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `SkeletonBlock`
- `StatCard`
- `AppDialog`
- `ConfirmDialog`
- `AppDrawer`
- `AppDropdownMenu`
- `Tooltip`
- `Popover`
- `SectionTabs`
- `Breadcrumbs`
- `BackLink`
- `Avatar`
- `VisuallyHidden`

## 10. Layout Rules

Layouts define structure, not business behavior.

Layouts must:

- Compose page regions consistently.
- Preserve responsive behavior.
- Preserve safe spacing around sticky or fixed UI.
- Accept slots for header, actions, filters, content, aside, footer, and state blocks as needed.
- Keep data fetching in the page or domain layer.
- Avoid knowing domain entities.

Layouts must not:

- Call server actions.
- Own form submission.
- Own domain filtering.
- Encode domain-specific labels.
- Hide important navigation behavior.

Reusable layout candidates:

- `PageLayout`
- `PageHeader`
- `ManagementPageLayout`
- `DetailPageLayout`
- `DashboardLayout`
- `SettingsLayout`
- `LibraryLayout`
- `EditorLayout`
- `WizardLayout`
- `SplitPaneLayout`
- `ModalFormLayout`

## 11. Hook Rules

Hooks must encapsulate reusable behavior, not hide business rules.

Hooks may:

- Manage disclosure state.
- Manage confirmation flow.
- Map server action feedback.
- Synchronize filters with URL state.
- Debounce values.
- Manage selection state.
- Manage pagination and sorting state.
- Manage upload UI state.
- Manage optimistic toggles when the action contract is clear.

Hooks must not:

- Fetch protected server data directly from the client unless the pattern is explicitly approved.
- Bypass Server Components for reads that should happen on the server.
- Hide permission checks.
- Depend on one domain unless stored inside that domain.
- Return unstable APIs that force unnecessary re-renders.

Global hook candidates:

- `useDisclosure`
- `useConfirmAction`
- `useServerActionFeedback`
- `useToastMutation`
- `useRHFServerErrors`
- `useFormResetOnSuccess`
- `useDirtyNavigationGuard`
- `useUrlFilters`
- `useSearchQuery`
- `useDebouncedValue`
- `useEntitySelection`
- `usePaginatedList`
- `useSortableList`
- `useFileUploadAction`
- `useOptimisticToggle`
- `useKeyboardShortcut`

## 12. Helper Rules

Helpers must be pure unless their name and location clearly communicate side effects.

Helpers must:

- Have stable inputs and outputs.
- Be easy to unit test.
- Avoid React state.
- Avoid UI rendering.
- Avoid direct Supabase access unless they live in the existing data/server layer.
- Prefer `Intl.DateTimeFormat` and `Intl.NumberFormat` for dates and numbers.

Helpers must not:

- Import components.
- Trigger navigation.
- Trigger toasts.
- Read browser globals unless browser-only ownership is clear.
- Mix formatting with mutation.

Global helper candidates:

- `mapFieldErrorsToForm`
- `applyServerActionResult`
- `formatDate`
- `formatDateTime`
- `formatRelativeDate`
- `formatNumber`
- `normalizeSearchText`
- `mergeSearchParams`
- `buildReturnHref`
- `getStatusTone`
- `getStatusLabel`
- `createConfirmationCopy`
- `buildEntityActionItems`
- `validateUploadFile`
- `formatFileSize`
- `getInitials`
- `sortByLabel`
- `groupBy`
- `assertNever`

## 13. Private Component Rules

A private component may stay local when:

- It is used once.
- It only exists to make a large file readable.
- It contains domain-specific copy or structure.
- It is unlikely to be reused.
- Extracting it globally would create a vague abstraction.

A private component should move to shared ownership when:

- It appears in two or more domains.
- It duplicates an existing shared component.
- It owns accessibility or interaction behavior that should be consistent.
- It becomes part of a repeated page pattern.

Private components should live near their domain during migration. They should not be promoted to `ui` or `app/shared` without meeting the creation criteria.

## 14. Public Component Rules

Public components are reusable outside one file or one route.

Public components must:

- Have clear prop names.
- Avoid leaking implementation details.
- Document non-obvious behavior through naming and types.
- Use official primitives.
- Avoid domain coupling unless they live in a domain folder.
- Preserve accessibility contracts.

Public components must not:

- Export multiple unrelated responsibilities from one file.
- Require callers to pass raw class strings for normal variants.
- Use boolean combinations that create unclear visual states.
- Change behavior silently across domains.

## 15. Next.js And React Rules

Server Components:

- Use Server Components for reads whenever possible.
- Keep secrets and protected data access on the server.
- Pass only serializable props to Client Components.
- Convert `Date`, `Map`, `Set`, and class instances before crossing the boundary.

Client Components:

- Use `'use client'` only when hooks, browser APIs, or event handlers are required.
- Client Components must not be async components.
- Client hooks such as `useSearchParams` and `usePathname` must be used with the required Suspense boundary rules.
- Client-side reads should be justified; prefer data from a Server Component.

Server Actions:

- Use Server Actions for internal mutations.
- Keep permission and ownership validation server-side.
- Do not rely on hidden buttons for security.
- Do not swallow `redirect`, `notFound`, `forbidden`, or `unauthorized` behavior in catch blocks.

Route Handlers:

- Use Route Handlers for external APIs, webhooks, or cacheable API endpoints.
- Do not create internal UI APIs when Server Components or Server Actions are the correct pattern.

## 16. Web Interface Guidelines Requirements

All refactor PRs must preserve or improve:

- Icon-only buttons have accessible labels.
- Form controls have visible labels or accessible names.
- Interactive elements use semantic elements.
- Focus states remain visible and use `focus-visible` patterns.
- Form errors are inline and connected to the field.
- Async feedback is announced where appropriate.
- Destructive actions require confirmation or undo.
- URL state reflects filters, tabs, pagination, and stateful panels when relevant.
- Long text is handled with wrapping, truncation, or clamping.
- Large lists are considered for virtualization or `content-visibility`.
- Dates and numbers use `Intl` helpers.
- Animations avoid `transition: all` and respect reduced motion.
- Modals and drawers manage scroll and overscroll safely.

## 17. Migration Strategy

The migration must happen in this order:

1. Contract and governance.
2. Tokens and variant language.
3. Low-level primitives.
4. Form primitives.
5. Feedback and overlay primitives.
6. Display primitives.
7. Layout primitives.
8. Global hooks.
9. Global helpers.
10. Small and medium component migration.
11. Large manager migration.
12. Folder reorganization.
13. Final cleanup and removal of deprecated APIs.

Do not migrate large managers before the primitives, hooks, helpers, and layouts they need exist.

Do not reorganize folders before the new architecture is stable.

Do not remove legacy components until all active consumers have migrated.

## 18. Compatibility Strategy

During migration:

- New primitives must be additive at first.
- Existing components may wrap new primitives if that reduces risk.
- Existing imports should remain stable until the migration phase explicitly changes them.
- Legacy APIs may remain temporarily when removing them would create broad churn.
- Any compatibility wrapper must have a documented removal condition.
- Avoid changing behavior and architecture in the same PR.
- Avoid visual restyling while changing component ownership.
- Prefer small PRs with one migration pattern at a time.

When old and new components coexist:

- New work must use the new contract.
- Existing old components may remain until their migration phase.
- Do not create new usage of deprecated components.
- Do not patch old components with new variants unless it is necessary for compatibility.

## 19. Deprecation Strategy

A component, hook, or helper may be deprecated when:

- A replacement exists.
- The replacement covers all required states.
- The migration path is clear.
- Existing consumers can be migrated safely.

Every deprecation note should include:

- Replacement name.
- Reason for deprecation.
- Allowed temporary uses.
- Removal condition.

Do not delete deprecated code in the same PR that introduces the replacement unless the usage count is tiny and the PR remains easy to review.

## 20. Prohibited Changes During Migration

Unless a task explicitly authorizes it, do not:

- Create arbitrary visual variants.
- Create duplicate primitives.
- Create a domain-specific button, input, select, textarea, modal, dropdown, or badge style.
- Rename routes.
- Rename database fields.
- Change auth roles.
- Change Supabase policies.
- Change global branding.
- Change global typography.
- Reorganize folders outside the current migration phase.
- Combine unrelated migrations in one PR.
- Convert a Server Component to a Client Component without justification.
- Move data fetching to the client when it can stay on the server.
- Add a dependency before checking existing project utilities.

## 21. Criteria Of Acceptance By Phase

### Phase 0: Contract

- Contract exists in the repo.
- Contract matches current architecture and target architecture.
- Contract includes PR checklist and migration order.

### Phase 1: Tokens

- Token names are semantic.
- Tokens cover spacing, radius, color roles, elevation, motion, z-index, typography, and icon sizes.
- No component migration depends on undocumented tokens.

### Phase 2: Primitives

- Primitives are accessible by default.
- Variants are official and limited.
- APIs are consistent across similar components.
- Existing behavior is preserved where wrappers are used.

### Phase 3: Forms

- Form fields use shared field structure.
- Errors are rendered through shared error primitives.
- Required, helper, disabled, loading, and error states are consistent.

### Phase 4: Feedback And Overlays

- Confirmations use shared infrastructure.
- Dropdowns use shared infrastructure.
- Dialogs and drawers follow focus, keyboard, and scroll rules.
- Destructive actions are not immediate.

### Phase 5: Layouts

- Repeated page structures use shared layouts.
- Layouts do not own business logic.
- Responsive behavior is preserved.

### Phase 6: Hooks And Helpers

- Repeated behavior is extracted into reusable hooks or pure helpers.
- Hooks do not hide permissions or server reads.
- Helpers are pure where expected.

### Phase 7: Component Migration

- Small and medium components use primitives and shared patterns.
- Large managers are split only after their dependencies are ready.
- PRs preserve behavior and avoid unrelated visual changes.

### Phase 8: Folder Reorganization

- Imports are updated intentionally.
- Ownership matches `ui`, `app/shared`, and `app/domains`.
- No broad behavior change is included.

### Phase 9: Cleanup

- Deprecated APIs with no consumers are removed.
- Compatibility wrappers with completed migration are removed.
- Lint, build, and browser QA pass.

## 22. PR Checklist

Every frontend refactor PR must answer:

- Did this PR reuse existing primitives before creating anything new?
- Does this PR avoid arbitrary variants?
- Does this PR avoid duplicate components?
- Is each new component in the correct ownership layer?
- Are Server Component and Client Component boundaries preserved?
- Are props serializable across server-client boundaries?
- Does any client hook that needs Suspense have a boundary?
- Are form labels, errors, helper text, and autocomplete handled correctly?
- Do icon-only controls have accessible labels?
- Do focus states remain visible?
- Does async feedback have clear loading, success, and error states?
- Are destructive actions confirmed or undoable?
- Are dates and numbers formatted through shared helpers or `Intl`?
- Does the URL reflect state when filters, tabs, or pagination matter?
- Does the change avoid broad folder moves unless it is the folder migration phase?
- Does the change avoid mixing behavior changes with architecture migration?
- Is there a documented deprecation path when replacing old APIs?
- Was the smallest relevant verification run for the touched area?

## 23. Roadmap

The required roadmap is:

1. Keep this contract as the baseline for all refactor tasks.
2. Define tokens and variant naming.
3. Stabilize primitives.
4. Stabilize forms.
5. Stabilize feedback, overlays, and actions.
6. Stabilize display primitives and state blocks.
7. Stabilize layouts.
8. Extract hooks and helpers.
9. Migrate low-risk components first.
10. Migrate complex managers one at a time.
11. Reorganize folders only after component APIs are stable.
12. Remove deprecated APIs.
13. Run final verification.

This order is mandatory unless a later technical decision record changes it.

## 24. Final Rule

The default answer to a new UI need is reuse.

Create a new component only when it represents a real reusable pattern, belongs to a clear ownership layer, has a stable API, and improves the long-term maintainability of the application.
