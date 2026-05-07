# Overview

## Product Summary

LocateHome is a real estate frontend for property discovery, search/filtering, listing detail, agents, and appointment booking. The root README describes buy/rent browsing, property management, roles, authentication, admin moderation, and backend architecture, but the current repo reality is a single Angular frontend app.

Prefer config and code over README when they differ. The README says Angular CLI 17, while `frontend/package.json` and `frontend/angular.json` show Angular 20 dependencies and Angular 20 CLI tooling.

## Current App Shape

- App root: `frontend/`
- Source root: `frontend/src`
- Browser entry: `frontend/src/main.ts`
- App config: `frontend/src/app/app.config.ts`
- Root shell: `frontend/src/app/app.component.*`
- Root routes: `frontend/src/app/app.routes.ts`
- Listings child routes: `frontend/src/app/features/listings/listings.routes.ts`

The shell renders:

- `HeaderComponent`
- `RouterOutlet`
- `FooterSectionComponent`

## Main Routes And Features

- `/` redirects to `/home`
- `/home` -> `HomePageComponent`
- `/listings` -> lazy-loaded `ListingsPageComponent`
- `/listings/sell` -> `ListingsPageComponent`
- `/listings/:id` -> `ListingDetailPageComponent`
- `/agents` -> `AgentsPageComponent`

Commented auth/dashboard routes exist, but they are not active.

## Backend-Integrated vs Local/Demo

Backend-integrated:

- Listings browse/search through `ListingsService.getListings`
- Listing detail through `ListingsService.getPropertyById`
- Property catalog and price ranges through `FiltersCatalogService`
- Agent listing and featured agents through `AgentsService`
- Appointment availability, appointment list, user profile, and appointment creation through `AppointmentBookingService`
- Google Places/Geocoding through `LocationCatalogService`

Mock/local/demo or partial:

- Home page still contains local featured/hot/recent listings, categories, trends, testimonials, and stats.
- Home page featured agents are live via `AgentsService.getFeaturedAgents`.
- Listing detail share/save/gallery/video/inquiry handlers currently log placeholders in `ListingDetailPageComponent`.
- `features/agents/mocks/agents.mock.ts` still exists, but `AgentsPageComponent` uses `AgentsService`.
- GeoNames and Overpass config/models exist; active runtime use is unclear from current services.

## How To Use This Context Pack

Read these files before changing the app:

- `01_ARCHITECTURE.md` for placement and boundaries.
- `02_IMPLEMENTED_FEATURES.md` for current feature status.
- `03_REUSABLE_COMPONENTS.md` before creating UI.
- `04_DEVELOPMENT_RULES.md` before coding.
- `05_API_AND_DATA_FLOW.md` before touching services/data.
- `06_SECURITY_AND_SSR.md` before touching auth, environment, browser APIs, hydration, or SSR.

This pack is not a backlog and does not define implementation tasks. It is a working map for future changes.
