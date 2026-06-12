# AGENTS.md

## Project Context

This project is a web app built with:

* Next.js
* TypeScript
* TailwindCSS
* Supabase

The app includes features related to nutrition, training, routines, users/clients, blogs, dashboards, authentication, roles, and account settings.

Multiple agents may work on this repository at the same time. Always assume another agent could be editing a different feature in parallel.

---

## Required First Step

Before making any code changes:

1. Read this `AGENTS.md`.
2. Read the skills and instructions inside `.agents/skills/`.
3. Follow the project structure, naming conventions, UI patterns, and security patterns already present in the codebase.
4. Inspect only the files needed for the assigned task.

Do not start editing files before understanding the relevant existing patterns.

---

## Parallel Agent Collaboration Rules

Other agents may be working on different tasks at the same time.

You must:

* Avoid deleting, reverting, overwriting, or simplifying code that is not directly related to your assigned task.
* Respect recent changes, even if they look unfamiliar.
* Do not perform broad refactors unless the task explicitly asks for them.
* Do not rename routes, folders, components, functions, tables, roles, or database fields unless absolutely required for your assigned task.
* Do not remove features, UI sections, database logic, auth logic, or validation logic created by other agents.
* If you find code that seems incomplete but is outside your task, leave it untouched.
* If you need to integrate with code from another area, make the smallest safe change possible.

Your job is to complete your assigned task without breaking parallel work.

---

## Scope Control

Work only on files necessary for the current task.

Avoid:

* Whole-app rewrites.
* Unrequested design refactors.
* Unrequested architecture changes.
* Unrequested database schema changes.
* Unrequested dependency changes.
* Unrequested route changes.
* Unrequested naming changes.
* Unrequested cleanup outside the task scope.

Prefer small, focused, reversible changes.

---

## Code Style

Follow the style already used in the project.

General rules:

* Use TypeScript.
* Keep code readable and maintainable.
* Prefer existing utilities, components, hooks, actions, and types.
* Avoid duplicate logic.
* Avoid unnecessary abstractions.
* Avoid adding new libraries unless the task clearly requires it.
* Keep components focused.
* Keep server-side logic separate from client-side UI when the project structure supports it.
* Preserve existing formatting conventions.

---

## UI/UX Rules

When modifying UI:

* Keep the current visual direction of the app.
* Do not change the global typography unless explicitly requested.
* Do not redesign unrelated pages.
* Reuse existing UI components whenever possible.
* Keep layouts responsive.
* Maintain consistent spacing, border radius, shadows, colors, and component hierarchy.
* Do not introduce a completely different design style inside one isolated section.
* Improve only what is necessary for the assigned task.

---

## Supabase and Database Rules

When working with Supabase:

* Reuse existing tables, types, actions, and query patterns when possible.
* Do not duplicate tables if an equivalent structure already exists.
* Keep database naming consistent with the existing schema.
* Validate all server-side mutations.
* Do not expose unnecessary user data to the frontend.
* Do not trust frontend-only checks for permissions.
* Respect Row Level Security policies.
* If new RLS policies are needed, create the minimum safe policies required for the task.
* If migrations are used in the project, follow the existing migration pattern.
* Do not modify unrelated policies or tables.

---

## Auth, Roles, and Permissions

Always respect the role system already present in the app.

General expectations:

* Admins can manage global/admin-level resources.
* Trainers can manage training-related resources if the feature allows it.
* Clients/users should not access admin-only or trainer-only actions.
* Users without an active plan should only access areas allowed by the app rules.
* Never rely only on hidden frontend buttons for security.
* Validate permissions in server actions, API routes, middleware, database policies, or the existing secure layer used by the project.

Do not invent new roles if the project already has a role system.

---

## Validation Rules

For forms and mutations:

* Validate required fields.
* Validate user permissions.
* Validate ownership when applicable.
* Validate URLs when the feature accepts external links.
* Return useful errors.
* Avoid silent failures.
* Keep validation consistent with the existing project style.

---

## Dependency Rules

Do not install new dependencies unless absolutely necessary.

Before adding a dependency:

1. Check whether the project already has a utility or library that solves the problem.
2. Prefer native browser/Node/Next.js functionality.
3. Prefer existing project patterns.
4. Add the dependency only if it clearly improves the implementation and is required by the task.

---

## Build, Lint, and Commands

Do not run heavy commands unless the task or project instructions explicitly allow it.

Avoid running:

* Full build
* Full lint
* Full test suite
* Dependency installation
* Database reset
* Destructive migration commands

If verification is necessary, prefer the smallest relevant command.

Never run destructive commands without explicit permission.

---

## Files and Data Safety

Do not delete files unless the task explicitly requires it.

Do not remove:

* Existing routes
* Existing components
* Existing database migrations
* Existing auth logic
* Existing environment variable usage
* Existing configuration files
* Existing generated types
* Existing styles used globally

Do not modify `.env` files or expose secrets.

---

## Implementation Approach

For every assigned task:

1. Read the relevant skills in `.agents/skills/`.
2. Inspect the relevant files.
3. Identify existing patterns.
4. Make the smallest complete implementation.
5. Keep changes scoped.
6. Validate permissions and data access.
7. Preserve work from other agents.
8. Summarize changes briefly.

---

## Response Format After Finishing

After completing the task, respond briefly with:

* Files modified
* Database tables, migrations, or policies changed, if any
* Main functionality implemented
* Important security or permission notes
* Any pending issues or assumptions

Do not include long explanations unless requested.

---

## Global Restrictions

Unless explicitly requested, do not:

* Redesign the entire app.
* Rewrite the architecture.
* Rename the app.
* Change global branding.
* Change global typography.
* Add payment systems.
* Add image or file uploads.
* Add external services.
* Add unnecessary libraries.
* Modify unrelated features.
* Remove existing functionality.
* Change database schemas unrelated to the task.
* Run destructive commands.
* Expose secrets or private data.

Focus only on the assigned task.
