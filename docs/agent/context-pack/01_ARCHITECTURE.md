# Architecture

## Folder Conventions

Current structure:

- `frontend/src/app/core/models`: app-wide model interfaces and view models.
- `frontend/src/app/core/services`: app-wide services such as catalog and location.
- `frontend/src/app/features/<feature>/pages`: routed page components.
- `frontend/src/app/features/<feature>/components`: feature-specific child components.
- `frontend/src/app/features/<feature>/services`: feature-owned API services.
- `frontend/src/app/features/<feature>/utils`: feature-owned pure utilities and mappers.
- `frontend/src/app/shared/ui`: reusable UI components used across features.

Use this structure. Do not introduce a new architecture pattern unless explicitly asked.

## Pages

Routed pages belong in `features/<feature>/pages`.

Examples:

- `HomePageComponent` in `features/home/pages/home-page`
- `ListingsPageComponent` in `features/listings/pages/listings-page`
- `ListingDetailPageComponent` in `features/listings/pages/listing-detail-page`
- `AgentsPageComponent` in `features/agents/pages/agents-page`

Page responsibilities:

- Own route/query-param synchronization.
- Own feature-level state orchestration.
- Call feature/core services.
- Pass view-ready data to feature/shared components.
- Avoid template-heavy data transformations.

## Feature Components

Feature components belong in `features/<feature>/components`.

Examples:

- Home: `HeroSectionComponent`, `SearchPanelComponent`, `TrendingPanelComponent`, `CategoriesSectionComponent`, `AgentsSectionComponent`, `TestimonialsSectionComponent`, `AppPromoSectionComponent`, `ValuationSectionComponent`
- Listings: `ListingsGridComponent`, `ListingsResultsHeaderComponent`, `ListingDetailShellComponent`, `AppointmentOverlayComponent`, `ListingsToolbarComponent`
- Agents: `AgentsHeroComponent`, `AgentsFiltersComponent`

Use feature components when the UI is specific to that feature's workflow or content model.

## Shared UI

Reusable components belong in `shared/ui`.

Examples:

- Cards: `ListingCardComponent`, `AgentCardComponent`, `CategoryCardComponent`, `InfoCardComponent`, `FeatureCardComponent`, `TestimonialCardComponent`
- Layout: `HeaderComponent`, `FooterSectionComponent`, `SectionShellComponent`, `SectionHeadingComponent`
- Filters/forms: `PropertyFiltersComponent`, `FilterSelectComponent`, `FilterChipGroupComponent`, `FilterSegmentTabsComponent`, `SortDropdownComponent`, `PriceRangeFieldComponent`, `LocationSearchFieldComponent`, `FormFieldErrorComponent`
- Media: `MediaGalleryComponent`, `MediaGalleryOverlayComponent`, `VideoStripComponent`, `VideoGalleryOverlayComponent`
- Navigation/stats: `PaginationComponent`, `StatsPillComponent`, `StatCardComponent`, `StatTileComponent`, `InfoChipComponent`

Strong rule: do not create a new component if a shared or feature component can be reused, composed, or lightly extended.

## Core Services And Models

Use `core/models` for app-wide data shapes:

- `listing.models.ts`
- `property-detail.vm.ts`
- `appointment.models.ts`
- `filter.models.ts`
- `agent.model.ts`
- `home.models.ts`
- Google/GeoNames/Overpass model files

Use `core/services` for app-wide services:

- `FiltersCatalogService`
- `LocationCatalogService`

Keep feature API services in the feature when the behavior is feature-owned:

- `ListingsService`
- `AppointmentBookingService`
- `AgentsService`

## Page / Service / Shared Boundaries

Pages:

- Convert route and UI events into service params.
- Coordinate signals and request streams.
- Bind shared/feature components.

Services:

- Build URLs and HTTP params.
- Own API calls.
- Catch API failures where an empty/fallback UI is acceptable.
- Map DTOs to app models when the mapping is simple and feature-specific.

Utilities:

- Keep pure data mapping and parsing here when it is larger than a small service helper.
- Examples: `mapApiPropertyToDetailView`, appointment schedule parsing/merging, property image URL resolution.

Shared UI:

- Should be driven by inputs and outputs.
- Should not know route details unless it is a shell/nav component.
- Should not call feature services unless already designed to do so.

## Routing And Lazy Loading

Root routes are in `app.routes.ts`.

Listings are lazy-loaded:

- `path: 'listings'`
- `loadChildren` imports `features/listings/listings.routes`
- `LISTINGS_ROUTES` maps index/sell/detail.

Keep new feature routes near their feature when adding routed feature areas. Do not revive commented auth/dashboard routes without implementing the missing components/guards.

## Mapping / API / View-Model Boundary

Important existing mapping points:

- `ListingsService.mapToListingItem(property: ListingsApiProperty): ListingItem`
- `mapApiPropertyToDetailView(property: ListingsApiProperty): PropertyDetailViewModel`
- `AgentsService.toAgentItem(a: AgentDto): AgentItem`
- `parseWeeklyAvailabilityResponse`
- `parseAppointmentsResponse`
- `mergeWeeklyAvailabilityAndAppointments`
- `resolvePropertyImageUrlForDisplay`

Keep API DTO tolerance and UI view-model mapping out of templates. When adding fields, update the model, mapper, and component contract together.
