# Implemented Features

## Home

Status: partial.

Important files:

- `features/home/pages/home-page/home-page.component.ts`
- `features/home/components/hero-section`
- `features/home/components/search-panel`
- `features/home/components/trending-panel`
- `features/home/components/categories-section`
- `features/home/components/agents-section`
- `features/home/components/testimonials-section`
- `features/home/components/app-promo-section`
- `features/home/components/valuation-section`

Current behavior:

- Rich landing/discovery page.
- Search panel navigates to `/listings` with query params.
- Category CTA navigates to `/listings`.
- Featured agents are loaded from `AgentsService.getFeaturedAgents`.
- Listings, stats, categories, trends, testimonials, and app promo bullets are local signal data.

Do not duplicate:

- Reuse `SearchPanelComponent` for home search UX.
- Reuse `ListingsCarouselSectionComponent` and `ListingCardComponent` for listing rows/carousels.
- Reuse `AgentsSectionComponent` and `AgentCardComponent` for agent previews.

## Listings / Search / Browse

Status: backend-integrated.

Important files:

- `features/listings/pages/listings-page/listings-page.component.ts`
- `features/listings/services/listings.service.ts`
- `features/listings/components/listings-grid`
- `features/listings/components/listings-results-header`
- `shared/ui/property-filters`
- `shared/ui/listing-card`
- `shared/ui/sort-dropdown`

Current behavior:

- URL query params drive request params.
- Filter changes debounce before navigation.
- Route param stream uses `switchMap` to cancel stale listing requests.
- `ListingsService.getListings` calls `/api/properties`.
- API response is mapped into `ListingItem`.
- Favorite toggling is local UI state only.

Do not duplicate:

- Use `PropertyFiltersComponent` for buy/rent filter payloads.
- Use `ListingsGridComponent` and `ListingCardComponent` for listing display.
- Use existing query param mapping and `ListingsQueryParams` when extending filters.

## Listing Detail

Status: backend-integrated with placeholder actions.

Important files:

- `features/listings/pages/listing-detail-page/listing-detail-page.component.ts`
- `features/listings/components/listing-detail-shell`
- `features/listings/utils/map-api-property-to-detail-vm.ts`
- `core/models/property-detail.vm.ts`
- `shared/ui/media-gallery`
- `shared/ui/amenities-grid`
- `shared/ui/video-strip`
- `shared/ui/contact-agent-form`

Current behavior:

- Route `:id` loads property via `ListingsService.getPropertyById`.
- API property maps to `PropertyDetailViewModel`.
- Detail shell renders gallery, stats, about, amenities, videos, agent/contact area, and appointment entry points.
- Share/save/gallery/video/inquiry/favorite handlers currently log placeholders in the page component.

Do not duplicate:

- Use `PropertyDetailViewModel` as the detail UI contract.
- Extend `mapApiPropertyToDetailView` for new property fields.
- Reuse media/gallery and contact/appointment components.

## Agents

Status: backend-integrated.

Important files:

- `features/agents/pages/agents-page/agents-page.component.ts`
- `features/agents/services/agents.service.ts`
- `features/agents/components/agents-hero`
- `features/agents/components/agents-filters`
- `shared/ui/agent-card`
- `shared/ui/pagination`
- `core/models/agent.model.ts`

Current behavior:

- Page/filter signals derive `AgentsQueryParams`.
- `AgentsService.getAgents` calls `/api/users/agents`.
- Page derives agents, page count, and total through `toSignal`.
- Featured agents are also used by home via `getFeaturedAgents`.
- `features/agents/mocks/agents.mock.ts` still exists but is not the active page data source.

Do not duplicate:

- Use `AgentsService` for agent API calls.
- Use `AgentCardComponent` for agent cards.
- Use `AgentsFiltersComponent` and `PaginationComponent` for the existing list UX.

## Appointment Booking

Status: backend-integrated but security-sensitive.

Important files:

- `features/listings/components/appointment-overlay`
- `features/listings/services/appointment-booking.service.ts`
- `features/listings/utils/appointment-schedule.util.ts`
- `core/models/appointment.models.ts`
- `shared/ui/contact-agent-form`

Current behavior:

- Overlay receives listing/agent context.
- Resolves property and owner/user id through listings service when needed.
- Loads availability, appointments, and user profile.
- Merges weekly availability with appointment bookings.
- Posts appointment creation to `/api/appointments`.
- Shows Material snack-bar feedback.
- Uses a hardcoded auth token today. That must not be copied.

Do not duplicate:

- Reuse `AppointmentOverlayComponent` and schedule utilities.
- Keep appointment parsing tolerant because backend response shapes are accepted flexibly.

## Filters / Catalog / Location Services

Status: backend-integrated and third-party integrated.

Important files:

- `core/services/filters-catalog.service.ts`
- `core/services/location-catalog.service.ts`
- `shared/ui/property-filters`
- `shared/ui/location-search-field`
- `shared/ui/price-range-field`
- `features/home/components/search-panel`

Current behavior:

- Property catalog loads from `/api/property-catalog`.
- Price ranges load from `/api/price-ranges`.
- Google Places autocomplete and Google Geocoding power location fields.
- GeoNames and Overpass environment config and models exist; active service usage is unclear.

Do not duplicate:

- Use `FiltersCatalogService` for categories/subtypes/price ranges.
- Use `LocationCatalogService` for place search and geocode parsing.
- Reuse `LocationSearchFieldComponent` and `PriceRangeFieldComponent` when possible.

## Header / Footer / Layout

Status: implemented.

Important files:

- `shared/ui/header`
- `shared/ui/footer-section`
- `shared/ui/section-shell`
- `shared/ui/section-heading`
- `app.component.html`

Current behavior:

- App shell always renders header and footer around the router outlet.
- Header owns top navigation and active URL logic.
- Footer is shared.
- Section shell/heading components support repeated page composition.

Do not duplicate:

- Use existing shell/layout components.
- Do not add page-level custom nav/footer variants unless asked.
