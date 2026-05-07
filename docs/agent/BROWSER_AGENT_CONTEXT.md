# LocateHome Browser Agent Context

Use this as a compact repo briefing when you cannot inspect the codebase.

## Product

- LocateHome is a real estate web app for browsing, filtering, viewing, and booking visits for properties.
- The current app is frontend-only in this repo.
- The main product areas are home, listings, listing detail, agents, filters, media, and appointments.
- The UI is already componentized. Reuse before creating anything new.

## Tech Baseline

- Angular 20 app.
- TypeScript 5.8.
- Angular Material 20.
- Bootstrap 5 is globally included.
- RxJS 7.8.
- SCSS is the styling language.
- Karma/Jasmine test setup exists.
- README may be stale; prefer package/config/code over README.

## App Shape

- Main app lives under `frontend/`.
- Angular source lives under `frontend/src`.
- Root routes are `/home`, `/listings`, `/listings/sell`, `/listings/:id`, and `/agents`.
- `/listings` lazy-loads listings child routes.
- The app shell renders header, router outlet, and footer.
- There are commented auth/dashboard routes, but they are not active.

## Strong Architecture Rules

- Do not introduce new architecture patterns unless explicitly asked.
- Do not create a new component if an existing shared or feature component can be reused, composed, or lightly extended.
- Create new components only when asked or when reuse would clearly damage existing contracts.
- Keep pages in `features/<feature>/pages`.
- Keep feature-specific child UI in `features/<feature>/components`.
- Keep reusable UI in `shared/ui`.
- Keep app-wide models and shared services in `core/models` and `core/services`.
- Keep feature services inside the owning feature unless they become app-wide.
- Keep API-to-UI mapping in services or feature utilities, not templates.
- Preserve existing route structure unless the user asks for routing changes.

## Angular Rules

- Prefer standalone components.
- Put dependency modules directly in each component's `imports`.
- Prefer `ChangeDetectionStrategy.OnPush`.
- Prefer signals for local component state.
- Prefer `computed` for derived state.
- Use `effect` carefully for synchronization with inputs or external sources.
- Use `input()` / `input.required()` for new signal-style inputs.
- Existing components still use `@Output` and `EventEmitter`; keep that style unless deliberately modernizing.
- Use `inject(...)` consistently for services.
- Use `takeUntilDestroyed` for observable subscriptions tied to component lifecycle.
- Use `toSignal` / `toObservable` where already helpful, especially service streams driven by signal state.
- Respect strict TypeScript and strict templates.
- Avoid `any`; when existing code uses it, narrow locally if touching it.
- Do not silence strictness with broad casts unless the API boundary is genuinely unknown.

## RxJS Rules

- Route/query state should drive page state.
- Use `switchMap` for request streams that should cancel stale calls.
- Use `catchError` to keep pages usable on failed requests.
- Use `shareReplay(1)` for shared API result streams when multiple signals derive from one request.
- Do not create nested subscriptions unless the existing component already owns a small imperative flow.

## SCSS And Design Rules

- Use global tokens in `styles.scss`: colors, surfaces, borders, radii, shadows, status colors, Material overrides.
- Prefer `var(--token-name)` over hardcoded repeated colors and radii.
- Continue BEM-ish component class naming like `listing-card__...`, `search-panel__...`, `home-header__...`.
- Use component SCSS for component layout.
- Use global SCSS only for app-wide tokens, Material overrides, and genuinely global utilities.
- Existing code uses some `::ng-deep`; avoid adding new `::ng-deep` unless there is no cleaner Material/global-token path.
- Keep UI responsive and preserve existing visual language.
- Do not redesign broad surfaces during small behavior changes.

## Material Rules

- Import Material modules at the standalone component that uses them.
- Use `MatIconModule` for Material icon usage.
- Use Material form-field/input/select/autocomplete modules for form controls where existing code does.
- Native date adapter is provided globally and also in appointment overlay.
- Prefer global Material CSS variables/tokens for theming before deep selector overrides.

## Security Rules

- Do not add hardcoded JWTs, bearer tokens, passwords, secrets, or private keys.
- Existing hardcoded JWTs in listings and appointment services are violations to remove, not patterns to copy.
- Do not commit unrestricted API keys.
- Existing Google Maps key appears in environment files; treat it as requiring restriction or environment management.
- Do not log contact, inquiry, appointment, auth, or sensitive user payloads.
- Remove debug `console.log` statements when touching related files.
- Do not put auth logic directly inside feature components.
- Prefer an auth service/interceptor for real token flow.

## SSR And Browser Safety

- Hydration is enabled with event replay.
- HttpClient is configured with fetch.
- SSR packages/files exist, but active Angular build SSR options are commented out and prerender is false.
- Treat SSR as partially present, not fully enabled.
- Guard browser-only APIs with platform checks.
- Be careful with `window`, `document`, `HostListener('window:...')`, timers, and direct DOM manipulation.

## Implemented Feature Summary

- Home: partial. Rich UI, local demo listings/categories/testimonials/trends, live featured agents.
- Listings browse/search: backend-integrated. Query params drive filters and `/api/properties` requests.
- Listing detail: backend-integrated for property detail; some actions are placeholders.
- Agents: backend-integrated. Filters/page state call `AgentsService`.
- Appointment booking: backend-integrated for availability, appointments, user profile, and appointment create, but uses hardcoded auth token.
- Filters/catalog: backend-integrated for property catalog and price ranges.
- Location: Google Places and Geocoding integration; GeoNames/Overpass config/models exist but current usage is limited/unclear.
- Header/footer/layout: implemented shared shell.

## Existing Reusable Components

- Listing display: `ListingCardComponent`, `ListingsGridComponent`, `ListingsCarouselSectionComponent`.
- Listing detail: `ListingDetailShellComponent`, `MediaGalleryComponent`, `MediaGalleryOverlayComponent`, `VideoStripComponent`, `VideoGalleryOverlayComponent`.
- Filters/search: `PropertyFiltersComponent`, `SearchPanelComponent`, `FilterSelectComponent`, `FilterChipGroupComponent`, `FilterSegmentTabsComponent`, `PriceRangeFieldComponent`, `LocationSearchFieldComponent`, `SortDropdownComponent`.
- Agents: `AgentCardComponent`, `AgentsFiltersComponent`, `AgentsHeroComponent`, `AgentsSectionComponent`.
- App/layout: `HeaderComponent`, `FooterSectionComponent`, `SectionShellComponent`, `SectionHeadingComponent`.
- Cards/chips/stats: `CategoryCardComponent`, `TestimonialCardComponent`, `InfoCardComponent`, `InfoChipComponent`, `StatCardComponent`, `StatTileComponent`, `StatsPillComponent`, `FeatureCardComponent`, `AppDownloadCardComponent`.
- Forms/booking: `ContactAgentFormComponent`, `AppointmentOverlayComponent`, `FormFieldErrorComponent`.
- Navigation: `PaginationComponent`.

## API And Data Flow

- Use `environment.apiUrl` for backend calls.
- Dev base is localhost; prod base is `https://soletechs.net/property.api`.
- Listings flow: route query params -> `ListingsPageComponent` -> `ListingsService.getListings` -> API response -> `mapToListingItem` -> listing UI.
- Detail flow: route `id` -> `ListingsService.getPropertyById` -> `mapApiPropertyToDetailView` -> detail shell.
- Agent flow: filters/page signals -> `AgentsService.getAgents` -> `AgentItem` list -> cards/pagination.
- Appointment flow: detail/overlay data -> owner/user lookup -> availability + appointments + profile -> merged schedule -> POST appointment.
- Catalog flow: `FiltersCatalogService` loads property catalog and price ranges for filters.

## How To Work

- First look for an existing component, service, model, or utility.
- Make minimal scoped changes.
- Preserve public component inputs/outputs unless the user asks for an API change.
- Mention touched file paths and validation run in final responses.
- If validation cannot run, say why.
- Do not create broad rewrites, migrations, or architectural inventions unless explicitly requested.
