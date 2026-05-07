# Development Rules

## Angular 20

- Code against Angular 20 and TypeScript 5.8.
- Prefer config/code over README if version details conflict.
- Keep compatibility with strict TypeScript and strict Angular templates.
- Do not loosen compiler options to make a change pass.

## Standalone Components

- New components should be standalone.
- Put Angular/Material/shared dependencies in the component `imports` array.
- Keep selectors prefixed with `app-`.
- Prefer `styleUrl` for new single-style components.
- Preserve existing public inputs/outputs unless the change requires a contract update.

## Signals And State

- Prefer `signal` for local component state.
- Prefer `computed` for derived state.
- Use `effect` for synchronization, not as a replacement for ordinary methods.
- Use `input()` and `input.required()` for new signal-style component inputs.
- Existing `@Output` + `EventEmitter` usage is acceptable; keep it for consistency unless explicitly modernizing.
- Do not store derived data separately if it can be computed.

## RxJS Boundaries

- Use RxJS for HTTP streams, route streams, debounced user input, and cancellation.
- Use `switchMap` for route/query/API flows where stale requests should be cancelled.
- Use `takeUntilDestroyed` for subscriptions owned by a component.
- Use `toSignal` for binding observable results into templates.
- Use `toObservable` when signal state needs to drive a stream.
- Use `catchError` to provide safe empty/fallback UI state where appropriate.
- Do not nest subscriptions unless the component already owns a small imperative workflow and cleanup is handled.

## Strict TypeScript

- Keep interfaces updated at API boundaries.
- Avoid `any`. If an external API shape is unknown, isolate `unknown` parsing in a service or utility.
- Do not bypass strict templates with broad casts in templates.
- Add optional fields intentionally and handle `undefined` at the view boundary.
- Keep DTO shapes separate from UI view models when the mapping is non-trivial.

## Change Detection

- Prefer `ChangeDetectionStrategy.OnPush`.
- Treat OnPush as the default for pages and UI components.
- Use signals and immutable updates to keep OnPush predictable.

## Angular Material

- Import Material modules locally in standalone components.
- Use `MatIconModule` for Material icons.
- Use Material form-field/input/select/autocomplete modules for Material form controls.
- Use `provideNativeDateAdapter` for Material date/calendar behavior; it already exists in app config and appointment overlay.
- Prefer Material theme variables and global tokens over deep CSS overrides.

## SCSS, BEM, And Tokens

- Use SCSS.
- Use global CSS tokens from `frontend/src/styles.scss`.
- Use `var(--primary)`, `var(--surface)`, `var(--border-soft)`, `var(--radius-*)`, etc. instead of repeated hardcoded design values.
- Continue BEM-ish component class naming.
- Keep component styles scoped to their component.
- Use global styles only for app-wide tokens, Material overrides, global utilities, and overlay styling.
- Avoid adding new `::ng-deep`. Existing usage is present, so treat this as "avoid unless necessary", not "never existed".
- Avoid broad visual redesigns while doing feature or bug fixes.

## Accessibility

- Preserve semantic buttons, links, form labels, and ARIA behavior in existing components.
- Icon-only controls need accessible names.
- Do not remove keyboard handling from overlays, galleries, menus, or pagination.
- Maintain focus visibility and disabled states.
- Keep form validation visible through existing error patterns such as `FormFieldErrorComponent`.

## Reuse Rules

- Search for existing shared and feature components before creating new ones.
- Reuse, compose, or lightly extend existing components when possible.
- Create new components only when asked or when reuse would clearly damage existing contracts.
- Do not create duplicate card, filter, gallery, pagination, agent, or appointment components.

## Service And API Rules

- Use `environment.apiUrl` for backend calls.
- Build query params through `HttpParams` and omit empty values.
- Keep auth out of individual feature components.
- Keep API parsing in services/utilities.
- Preserve tolerant response parsing where already implemented.
- Keep mapping functions near the owning feature unless reused app-wide.

## Security Rules

- Do not add hardcoded JWTs, bearer tokens, passwords, secrets, or private keys.
- Existing hardcoded tokens in listings and appointment services must be removed when auth is addressed.
- Do not commit unrestricted API keys.
- Do not log user contact, inquiry, appointment, auth, or payment-like data.
- Remove debug logs when touching nearby code.

## Response Expectations For Agents

- State what files changed.
- State what validation was run.
- If validation could not run, say why.
- Keep summaries short and path-specific.
- Do not invent tickets, task plans, or backlog items in these context docs.
- Do not perform broad rewrites unless explicitly requested.
