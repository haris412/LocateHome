# Security And SSR

## Security Red Lines

- Do not add hardcoded JWTs, bearer tokens, passwords, secrets, private keys, or unrestricted API keys.
- Do not copy existing hardcoded tokens.
- Do not log user contact, inquiry, appointment, auth, or sensitive payloads.
- Do not put auth/token ownership in feature components.
- Do not rely on browser-only secrets; anything shipped in Angular code is visible to users.

## Current Security Issues To Know

Hardcoded frontend tokens exist:

- `ListingsService.authToken` in `features/listings/services/listings.service.ts`
- `AUTH_TOKEN` in `features/listings/services/appointment-booking.service.ts`

These are violations to remove when auth is addressed. They are not conventions.

Committed browser API key exists:

- `googleMapsKey` in both environment files.
- `LocationCatalogService` reads it and sends it to Google APIs.

Browser Google keys can be public only when properly restricted. Treat this key as requiring domain/API restrictions or externalized environment management.

Debug logs exist:

- Listing detail handlers log share/save/gallery/video/inquiry/appointment events.
- Listing card/grid log clicked ids.
- Listings toolbar logs search data.

Remove or avoid expanding logs when touching these areas.

## Auth Expectations

- Replace hardcoded tokens with a real auth flow.
- Prefer an auth service plus HTTP interceptor for attaching tokens.
- Keep token refresh/session ownership centralized.
- Backend must enforce authorization; frontend checks are not sufficient.
- Do not block future auth by baking tokens into feature services.

## Environment And API Key Expectations

- `environment.apiUrl` is the backend base.
- Development currently points to localhost.
- Production currently points to a hosted API.
- GeoNames uses HTTP URLs in environment config; avoid insecure production dependencies where possible.
- Google Maps key must be restricted by referrer/domain and limited API scope.
- Do not add secrets to `environment.ts` or `environment.prod.ts`.

## Logging Restrictions

Never log:

- JWTs or auth headers.
- Names, emails, phone numbers from contact/inquiry/appointment forms.
- Appointment client payloads.
- Raw API responses containing user data.
- Secrets or API keys.

Allowed:

- Short non-sensitive debugging during local development, removed before finalizing.
- Error messages that do not expose payloads or credentials.

## Hydration Status

Hydration is enabled:

- `provideClientHydration(withEventReplay())` in `app.config.ts`

HttpClient is configured with fetch:

- `provideHttpClient(withFetch())` in `app.config.ts`

This means code should be compatible with hydration behavior even though full SSR build is not currently active.

## SSR Status

SSR is partially present but not actively enabled in build config:

- `@angular/ssr` and `@angular/platform-server` are dependencies.
- `main.server.ts` and `app.config.server.ts` exist.
- `angular.json` comments out `server`, `prerender`, and `ssr`.
- Production config sets `prerender` to false.

Treat SSR as "present but inactive/uncertain." Do not assume server rendering is fully operational.

## Browser-Only API Safety

Current browser-touching areas include:

- Speech recognition in `SearchPanelComponent` and `PropertyFiltersComponent`
- `window` host listeners in carousel/trending/gallery components
- `document.body.style.overflow` in video gallery overlay
- Timers in appointment overlay

Rules:

- Guard direct `window`, `document`, speech recognition, storage, geolocation, and DOM APIs with platform checks when code can run during SSR/hydration.
- Keep browser-only code inside methods/effects that only run in the browser where possible.
- Avoid direct DOM manipulation unless a component genuinely needs overlay/scroll behavior.
- Preserve cleanup for timers, subscriptions, and DOM side effects.

## Safe Change Pattern

When touching security or SSR-adjacent code:

- Identify whether code can run before hydration completes.
- Identify whether code can run on the server if SSR is re-enabled.
- Keep sensitive data out of logs and bundles.
- Keep auth/token code centralized.
- Prefer typed service boundaries and small utilities over component-level network/security logic.
