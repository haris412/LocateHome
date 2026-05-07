# Reusable Components

Strong rule:

Do not create a new component if an existing shared or feature component can be reused, composed, or lightly extended. Create new components only when asked or when reuse would clearly damage existing contracts.

## Listing Cards And Grids

Components:

- `shared/ui/listing-card/ListingCardComponent`
- `features/listings/components/listings-grid/ListingsGridComponent`
- `shared/ui/listings-carousel-section/ListingsCarouselSectionComponent`
- `shared/ui/listing-grid/ListingGridComponent` exists but appears less developed/less central.

Purpose:

- Render listing cards, card grids, compact/list variants, and carousel-style listing sections.

Where reused:

- Listings page grid.
- Home page listing sections.
- Listing detail nearby/listing carousel areas.

Reuse/extend:

- Extend `ListingItem` and `ListingCardComponent` for new card data.
- Use `variant` before creating a new card layout.
- Use `ListingsGridComponent` for browse/listing result pages.

## Filters And Search

Components:

- `shared/ui/property-filters/PropertyFiltersComponent`
- `features/home/components/search-panel/SearchPanelComponent`
- `shared/ui/filter-select-card/FilterSelectComponent`
- `shared/ui/filter-chip-group/FilterChipGroupComponent`
- `shared/ui/filter-segment-tabs/FilterSegmentTabsComponent`
- `shared/ui/filter-shell/FilterShellComponent`
- `shared/ui/price-range-field/PriceRangeFieldComponent`
- `shared/ui/location-search-field/LocationSearchFieldComponent`
- `shared/ui/sort-dropdown/SortDropdownComponent`

Purpose:

- Buy/rent modes, field selectors, chips, search text, voice search, location autocomplete, price selection, and sorting.

Where reused:

- Home search.
- Listings toolbar/filter flow.
- Shared filter primitives.

Reuse/extend:

- Use `PropertyFilterPayload` for listing filters.
- Extend `FilterSelectConfig` and `FilterOption` instead of inventing a new filter shape.
- Use `FiltersCatalogService` for category/subtype options.
- Use `LocationCatalogService` for city/area search.

## Media And Gallery

Components:

- `shared/ui/media-gallery/MediaGalleryComponent`
- `shared/ui/media-gallery-overlay/MediaGalleryOverlayComponent`
- `shared/ui/video-strip/VideoStripComponent`
- `shared/ui/video-gallery-overlay/VideoGalleryOverlayComponent`

Purpose:

- Property image galleries, overlay browsing, video strips, video overlay browsing.

Where reused:

- Listing detail shell.

Reuse/extend:

- Extend `PropertyDetailViewModel.gallery` or `PropertyVideoItem`.
- Keep gallery state inside existing media components where possible.
- Do not make a second property gallery implementation.

## Agent Components

Components:

- `shared/ui/agent-card/AgentCardComponent`
- `features/agents/components/agents-filters/AgentsFiltersComponent`
- `features/agents/components/agents-hero/AgentsHeroComponent`
- `features/home/components/agents-section/AgentsSectionComponent`

Purpose:

- Agent list cards, agent page filters, hero header, and home featured agent section.

Where reused:

- Agents page.
- Home page featured agents.

Reuse/extend:

- Use `AgentItem` from `core/models/agent.model.ts`.
- Use `AgentsService` for backend data.
- Add inputs to `AgentCardComponent` only if card variants are genuinely needed.

## Appointment And Contact UI

Components:

- `features/listings/components/appointment-overlay/AppointmentOverlayComponent`
- `shared/ui/contact-agent-form/ContactAgentFormComponent`
- `shared/ui/form-field-error/FormFieldErrorComponent`

Purpose:

- Contact/inquiry form, appointment overlay, form validation display, schedule selection.

Where reused:

- Listing detail shell.

Reuse/extend:

- Use `AppointmentOverlayData`, `AppointmentBookingPayload`, and `AppointmentDateSlots`.
- Use appointment schedule utilities rather than duplicating date/slot merge logic.
- Keep appointment API calls in `AppointmentBookingService`.

## Layout And Page Composition

Components:

- `shared/ui/header/HeaderComponent`
- `shared/ui/footer-section/FooterSectionComponent`
- `shared/ui/section-shell/SectionShellComponent`
- `shared/ui/section-heading/SectionHeadingComponent`
- `shared/ui/brand-logo/BrandLogoComponent`

Purpose:

- App shell, navigation, footer, section wrappers, repeated headings, branding.

Where reused:

- Root app shell.
- Home page and feature sections.
- Detail/listing page sections.

Reuse/extend:

- Use section shell/heading for repeated page bands.
- Do not add a second header/footer without explicit product direction.

## Cards, Chips, Stats, Promo UI

Components:

- `shared/ui/category-card/CategoryCardComponent`
- `shared/ui/testimonial-card/TestimonialCardComponent`
- `shared/ui/info-card/InfoCardComponent`
- `shared/ui/info-chip/InfoChipComponent`
- `shared/ui/stat-card/StatCardComponent`
- `shared/ui/stat-tile/StatTileComponent`
- `shared/ui/stats-pill/StatsPillComponent`
- `shared/ui/feature-card/FeatureCardComponent`
- `shared/ui/app-download-card/AppDownloadCardComponent`
- `shared/ui/social-button/SocialButtonComponent`

Purpose:

- Repeated content blocks, metrics, chips, feature/promo UI, social-style buttons.

Where reused:

- Home page sections.
- Detail page stats/amenities.
- Agent/listing presentation.

Reuse/extend:

- Check these before building one-off cards.
- Keep text/data passed through inputs, not hardcoded in a reusable component unless already part of its design.

## Pagination

Component:

- `shared/ui/pagination/PaginationComponent`

Purpose:

- 1-based page navigation with safe page/pageCount handling.

Where reused:

- Agents page.

Reuse/extend:

- Use for backend-paginated lists.
- Keep page state in the parent page; emit page changes from the component.

## Feature-Level Home Components

Components:

- `HeroSectionComponent`
- `SearchPanelComponent`
- `TrendingPanelComponent`
- `CategoriesSectionComponent`
- `TestimonialsSectionComponent`
- `AppPromoSectionComponent`
- `ValuationSectionComponent`

Purpose:

- Home-specific composition and discovery sections.

Reuse/extend:

- Use these for home page evolution.
- Extract to `shared/ui` only if another feature genuinely reuses them.

## Feature-Level Listing Components

Components:

- `ListingsResultsHeaderComponent`
- `ListingsToolbarComponent`
- `ListingDetailShellComponent`
- `AppointmentOverlayComponent`
- `ListingsGridComponent`

Purpose:

- Listing browse/detail workflow UI.

Reuse/extend:

- Keep listing-specific behavior here.
- Promote to `shared/ui` only after real cross-feature reuse appears.
