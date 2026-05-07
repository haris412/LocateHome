# LocateHome Frontend - Folder Structure

## Overview
This project follows a **scalable, feature-based Angular architecture** with clear separation of concerns using `core`, `features`, and `shared` layers.

## Directory Structure

```
src/
├── app/
│   ├── app.component.*              # Root component (RouterOutlet)
│   ├── app.routes.ts                # Central route definitions
│   ├── app.config.server.ts         # SSR configuration
│   │
│   ├── core/                        # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # Route protection
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # HTTP interceptor for auth tokens
│   │   ├── models/
│   │   │   └── auth.models.ts       # Core data types
│   │   └── services/
│   │       └── auth.service.ts      # Authentication service
│   │
│   ├── features/                    # Feature modules
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── auth-hero-panel/
│   │   │   │   ├── login-card/
│   │   │   │   └── signup-card/
│   │   │   ├── pages/
│   │   │   │   └── auth-portal-page/
│   │   │   ├── services/            # Feature-specific services (optional)
│   │   │   └── models/              # Feature-specific types (optional)
│   │   │
│   │   └── [future-features]/       # Other feature modules follow same pattern
│   │
│   ├── dashboard/                   # Dashboard feature
│   │   └── dashboard.component.ts
│   │
│   └── shared/                      # Reusable code across entire app
│       ├── ui/                      # Reusable UI components
│       │   ├── brand-logo/
│       │   ├── feature-card/
│       │   ├── segmented-tabs/
│       │   ├── social-button/
│       │   └── stat-card/
│       ├── layouts/                 # Layout wrappers (NEW)
│       │   └── [layout-components]/
│       ├── pipes/                   # Custom Angular pipes (NEW)
│       │   └── [custom-pipes]/
│       ├── directives/              # Custom Angular directives (NEW)
│       │   └── [custom-directives]/
│       ├── validators/              # Form validators
│       │   └── password-match.validator.ts
│       └── utils/                   # Helper functions & utilities (NEW)
│           └── [utility-files]/
│
├── assets/
│   └── images/                      # Static image assets
│
├── environments/
│   ├── environment.ts               # Development config
│   └── environment.prod.ts          # Production config
│
├── index.html                       # Main HTML template
├── main.ts                          # Browser entry point
├── main.server.ts                   # SSR entry point
└── styles.scss                      # Global styles

Root-level files:
├── angular.json                     # Angular CLI config
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.spec.json              # Test-specific TS config
└── FOLDER_STRUCTURE.md             # This file
```

## Architecture Layers

### 1. **Core Layer** (`src/app/core/`)
**Purpose**: Singleton services and application-wide utilities

- **guards/**: Route protection logic (AuthGuard, RoleGuard, etc.)
- **interceptors/**: HTTP request/response middleware (auth tokens, error handling)
- **models/**: Core data types and interfaces
- **services/**: Singleton services (AuthService, HTTPService, etc.)

⚠️ **Rule**: Imported only by root AppComponent or lazy-loaded features

### 2. **Features Layer** (`src/app/features/`)
**Purpose**: Feature-specific code organized by business domain

Each feature folder contains:
- **components/**: Reusable components within the feature
- **pages/**: Smart/container components that handle routing
- **services/** (optional): Feature-specific business logic
- **models/** (optional): Feature-specific types and interfaces

✅ **Rule**: Features can use core and shared, but NOT other features

### 3. **Shared Layer** (`src/app/shared/`)
**Purpose**: Reusable code that multiple features need

- **ui/**: Dumb/presentational components (no business logic)
- **layouts/**: Layout wrappers and containers
- **pipes/**: Custom Angular pipes (transformers)
- **directives/**: Custom Angular directives
- **validators/**: Reusable form validators
- **utils/**: Helper functions and utilities

✅ **Rule**: Used across multiple features - must be domain-agnostic

## Recent Changes

### ✅ Cleanup Done
- ❌ Removed legacy `src/app/auth/` folder (consolidated into `features/auth/`)
- ❌ Removed `app-routing.module.ts` (using modern standalone routing via `app.routes.ts`)

### ✅ New Structure Added
- ✨ Created `shared/layouts/` - For layout components
- ✨ Created `shared/utils/` - For helper functions
- ✨ Created `shared/pipes/` - For custom pipes
- ✨ Created `shared/directives/` - For custom directives
- ✨ Created `features/auth/services/` - For auth feature services
- ✨ Created `features/auth/models/` - For auth feature types

## Best Practices

### DO ✅
- Import from `core` in features (singleton services)
- Import from `shared` anywhere (reusable code)
- Keep features isolated and independently testable
- Use barrel exports (`index.ts`) for clean imports
- Place feature-specific code in the feature folder

### DON'T ❌
- Import from feature A into feature B (breaks modularity)
- Place business logic in shared/ui components
- Create circular dependencies
- Put everything in core (only singletons)
- Mix feature code with shared code

## File Naming Conventions

```
Components:      my-component.component.ts
Services:        my.service.ts
Guards:          my.guard.ts
Interceptors:    my.interceptor.ts
Pipes:           my.pipe.ts
Directives:      my.directive.ts
Models/Types:    my.model.ts
Tests:           my.component.spec.ts
```

## Lazy Loading (Future)

For lazy-loaded features, add routing to the feature:

```typescript
// features/auth/auth.routes.ts
export const authRoutes: Routes = [
  { path: '', component: AuthPortalPageComponent },
  { path: 'login', component: LoginComponent }
];

// app.routes.ts
{
  path: 'auth',
  loadChildren: () => import('./features/auth/auth.routes')
    .then(m => m.authRoutes)
}
```

## Adding New Features

When creating a new feature:

```
features/my-feature/
├── components/
│   └── my-component/
│       ├── my-component.component.ts
│       ├── my-component.component.html
│       ├── my-component.component.scss
│       └── my-component.component.spec.ts
├── pages/
│   └── my-page/
│       ├── my-page.component.ts
│       ├── my-page.component.html
│       └── my-page.component.scss
├── services/
│   └── my-feature.service.ts
├── models/
│   └── my-feature.model.ts
└── my-feature.routes.ts (if lazy-loaded)
```

---

**Last Updated**: March 9, 2026
