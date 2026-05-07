# API And Data Flow

## Environment API Base

Backend calls should use `environment.apiUrl`.

Current environment files:

- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.prod.ts`

Current values:

- Development: `http://localhost:3000`
- Production: `https://soletechs.net/property.api`

The production environment comment appears stale/unclear because it references local SSR testing while using a hosted API URL.

## Properties / Listings

Primary files:

- `features/listings/services/listings.service.ts`
- `core/models/listing.models.ts`
- `features/listings/pages/listings-page/listings-page.component.ts`
- `features/listings/utils/property-image-url.util.ts`

Service:

- `ListingsService`
- `getListings(params: ListingsQueryParams)`
- `getPropertyById(id: string)`
- `resolvePropertyListMatch(candidateId: string)`
- `resolvePropertyMongoId(candidateId: string)`

API endpoints:

- `GET /api/properties`
- `GET /api/properties/:id`

Query params currently supported:

- `page`
- `limit`
- `purpose`
- `status`
- `propertyType`
- `subType`
- `city`
- `neighborhood`
- `minPrice`
- `maxPrice`
- `sortBy`
- `sortOrder`

Data flow:

`route query params -> ListingsPageComponent.mapQueryParamsToRequest -> ListingsService.getListings -> ListingsApiResponse -> ListingsService.mapToListingItem -> ListingsGridComponent -> ListingCardComponent`

Rules:

- Reuse `ListingsQueryParams`.
- Keep empty params out of requests.
- Keep listing card UI fed by `ListingItem`.
- Add new API fields to `ListingsApiProperty` first, then map to UI models.

## Property Detail

Primary files:

- `features/listings/pages/listing-detail-page/listing-detail-page.component.ts`
- `features/listings/utils/map-api-property-to-detail-vm.ts`
- `core/models/property-detail.vm.ts`
- `features/listings/components/listing-detail-shell`

Service:

- `ListingsService.getPropertyById(id)`

API endpoint:

- `GET /api/properties/:id`

Response parsing:

- `ListingsService.parseSinglePropertyResponse` accepts property at root, under `data`, or under `data.property`.

Data flow:

`route id -> ListingsService.getPropertyById -> mapApiPropertyToDetailView -> PropertyDetailViewModel -> ListingDetailShellComponent`

Rules:

- Keep detail view rendering bound to `PropertyDetailViewModel`.
- Update `mapApiPropertyToDetailView` for new detail fields.
- Do not push raw API property objects into detail templates.

## Property Catalog

Primary file:

- `core/services/filters-catalog.service.ts`

Service:

- `FiltersCatalogService.loadCatalog()`
- `getSubtypeOptions(categorySlug)`
- `categoryForSubtypeSlug(subtypeSlug)`
- `isKnownCategorySlug(slug)`
- `resolveSubtypeSlug(value)`

API endpoint:

- `GET /api/property-catalog`

Data flow:

`FiltersCatalogService.loadCatalog -> categories signal -> propertyTypeOptions computed -> filter field options`

Rules:

- Use catalog service for property type/subtype logic.
- Do not hardcode new property categories in page templates if catalog support exists.

## Price Ranges

Primary files:

- `core/services/filters-catalog.service.ts`
- `shared/ui/price-range-field`

Service:

- `FiltersCatalogService.loadPriceRanges(currency)`
- `getPriceRangeForMode(mode)`

API endpoint:

- `GET /api/price-ranges`

Query:

- `currency`

Rules:

- Use the catalog service for dynamic price ranges.
- Keep UI price labels and selected values in the price field or filter mapping layer.

## Availability And Appointments

Primary files:

- `features/listings/services/appointment-booking.service.ts`
- `features/listings/components/appointment-overlay`
- `features/listings/utils/appointment-schedule.util.ts`
- `core/models/appointment.models.ts`

Service:

- `AppointmentBookingService.getUserAvailability(userId)`
- `getAppointmentsForUser(userId)`
- `getUserProfile(userId)`
- `createAppointment(body)`

API endpoints:

- `GET /api/users/:userId/availability`
- `GET /api/appointments/user/:userId`
- `GET /api/users/:userId/name`
- `POST /api/appointments`

Data flow:

`Listing detail -> AppointmentOverlayData -> resolve property/owner user -> availability + appointments + profile -> parse/merge schedule -> selected date/slot/form -> create appointment -> refresh appointments`

Rules:

- Reuse appointment schedule utilities.
- Keep response shape tolerance in the parsers.
- Do not copy the existing hardcoded appointment auth token.
- Keep appointment POST body aligned with `CreateAppointmentRequest`.

## Agents

Primary files:

- `features/agents/services/agents.service.ts`
- `features/agents/pages/agents-page/agents-page.component.ts`
- `core/models/agent.model.ts`
- `shared/ui/agent-card`
- `features/agents/components/agents-filters`

Service:

- `AgentsService.getAgents(params)`
- `getFeaturedAgents()`
- `getAgentById(id)`
- `toAgentItem(a: AgentDto)`

API endpoints:

- `GET /api/users/agents`
- `GET /api/users/agents/featured`
- `GET /api/users/agents/:id`

Data flow:

`filters/page signals -> computed AgentsQueryParams -> AgentsService.getAgents -> AgentsResult -> toSignal agents/pageCount/total -> AgentCardComponent + PaginationComponent`

Rules:

- Use `AgentsService`, not `agents.mock.ts`, for active agent pages.
- Reuse `AgentItem` for UI.
- Add new filters through `AgentsQueryParams`, `AgentsFiltersComponent`, and `AgentsPageComponent.params`.

## Location / Geocoding / Places / Overpass

Primary files:

- `core/services/location-catalog.service.ts`
- `core/models/google-places.models.ts`
- `core/models/geonames.models.ts`
- `core/models/overpass.models.ts`
- `shared/ui/location-search-field`
- `features/home/components/search-panel`

Active service integration:

- Google Places autocomplete: `places:autocomplete`
- Google Geocoding: `geocode/json`
- Country code from `environment.listingCountryCode`
- API key from `environment.googleMapsKey`

Configured but unclear/limited active usage:

- GeoNames environment config and models exist.
- Overpass environment config and models exist.

Rules:

- Use `LocationCatalogService` for place search and city/neighborhood parsing.
- Guard browser-only voice/location APIs with platform checks.
- Do not add unrestricted API keys.

## General API Rules

- Use `HttpClient`.
- Use `environment.apiUrl`.
- Use typed interfaces for known API responses.
- Use `unknown` and parser helpers for uncertain API shapes.
- Map API DTOs to UI models before rendering.
- Keep fallback behavior explicit with `catchError`.
- Do not add API calls directly inside shared presentation components unless the component already owns that behavior by design.
