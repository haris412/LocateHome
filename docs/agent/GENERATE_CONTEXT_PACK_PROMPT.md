# Codex Task — Generate LocateHome Agent Context Pack

Read-only sweep. Generate a concise context pack for future AI coding agents.

## Output files

Create/update only these files:

1. `docs/agent/BROWSER_AGENT_CONTEXT.md`
2. `docs/agent/context-pack/00_OVERVIEW.md`
3. `docs/agent/context-pack/01_ARCHITECTURE.md`
4. `docs/agent/context-pack/02_IMPLEMENTED_FEATURES.md`
5. `docs/agent/context-pack/03_REUSABLE_COMPONENTS.md`
6. `docs/agent/context-pack/04_DEVELOPMENT_RULES.md`
7. `docs/agent/context-pack/05_API_AND_DATA_FLOW.md`
8. `docs/agent/context-pack/06_SECURITY_AND_SSR.md`

## Important rule

Do not create task plans.  
Do not create backlog items.  
Do not create implementation tickets.  
This is only a context/rules pack so an AI agent understands the app before making changes.

## Style rules

- No line-number citations in `BROWSER_AGENT_CONTEXT.md`.
- No long audit dumps.
- Keep each file practical and skimmable.
- Prefer clear rules over explanations.
- Mention uncertainty when something is unclear.
- Use current repo reality, not assumptions.
- Prefer config/code over README if they conflict.

---

# 1. Browser portable file

Generate:

`docs/agent/BROWSER_AGENT_CONTEXT.md`

Purpose:
A single pasteable file for browser-based AI agents that cannot inspect the repo.

Include:
- What LocateHome is
- Tech baseline
- Architecture rules
- Angular rules
- SCSS/token rules
- Security rules
- Implemented feature summary
- Existing reusable components summary
- Strong rule: reuse existing shared/feature components before creating new ones
- Strong rule: do not introduce new architecture patterns unless explicitly asked

Target length:
120–200 lines max.

Do not include:
- file line numbers
- long evidence lists
- audit-style findings

---

# 2. IDE context-pack files

Generate multiple focused files under:

`docs/agent/context-pack/`

These are for IDE-based agents that can read files but should not need to scan the whole repo first.

## `00_OVERVIEW.md`

Include:
- Product summary
- Current app shape
- Main routes/features
- What is backend-integrated vs mock/local/demo
- How an agent should use the context pack

## `01_ARCHITECTURE.md`

Include:
- Current folder conventions
- Where pages go
- Where feature components go
- Where shared UI goes
- Where core services/models go
- Page/service/shared component boundaries
- Routing/lazy loading conventions
- Mapping/API/view-model boundary

## `02_IMPLEMENTED_FEATURES.md`

Include implemented areas:
- Home
- Listings/search/browse
- Listing detail
- Agents
- Appointment booking
- Filters/catalog/location services
- Header/footer/layout

For each:
- status: backend-integrated, mock/local, partial, placeholder
- important existing files/components/services
- what not to duplicate

## `03_REUSABLE_COMPONENTS.md`

Inventory reusable components:
- shared UI components
- feature-level reusable components
- listing cards/grids
- filters/search panels
- media/gallery overlays
- pagination
- agent cards/filters
- appointment-related UI
- layout/header/footer/section shells

For each component/group:
- purpose
- where it is reused
- what to extend/reuse before creating something new

Must include this rule clearly:
Do not create a new component if an existing shared or feature component can be reused, composed, or lightly extended. Create new components only when asked or when reuse would clearly damage existing contracts.

## `04_DEVELOPMENT_RULES.md`

Include:
- Angular 20 rules
- standalone component rules
- signal/state rules
- RxJS usage boundaries
- strict TypeScript rules
- OnPush preference
- Material import/style rules
- SCSS/BEM/token rules
- accessibility rules
- response expectations for agents

Keep it non-negotiable and direct.

## `05_API_AND_DATA_FLOW.md`

Include:
- environment API base approach
- current API areas:
  - properties/listings
  - property detail
  - property catalog
  - price ranges
  - availability
  - appointments
  - agents if applicable
  - location/geocoding/places/overpass if applicable
- data flow:
  route/query params -> page state -> service request -> API response -> mapper/view model -> shared UI
- where mapping currently belongs
- rules for adding/changing API calls

## `06_SECURITY_AND_SSR.md`

Include:
- current security red lines
- no hardcoded JWTs/tokens
- no committed secrets
- browser API key handling expectations
- logging restrictions
- hydration status
- SSR status
- browser-only API safety rules

## Evidence style for IDE context files

For IDE context-pack files, include file paths and symbol names only where useful.
Do not add noisy line-by-line audit references.
Keep evidence compact.
