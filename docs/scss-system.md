# SCSS System

## Purpose

LocateHome styling should be controlled through global `:root` CSS variables and shared SCSS patterns, not scattered hardcoded values inside component styles. Component SCSS should describe local layout and state while reusing the global token system for colors, typography, radii, shadows, and common surfaces.

## Token Categories

The global token source is `frontend/src/styles.scss`.

- Font family: `--font-family`
- Brand colors: `--primary`, `--primary-hover`, `--primary-strong`, `--primary-soft`, `--primary-soft-hover`, `--primary-cta-hover`, `--secondary`, `--tertiary`
- Text colors: `--font-main`, `--font-secondary`
- Surfaces: `--surface`, `--surface-soft`, `--surface-muted`, `--surface-page`, `--surface-disabled`, `--surface-footer`, `--surface-frost`
- Borders: `--border-soft`, `--border-soft-strong`, `--border-field`, `--border-field-hover`, `--border-white-soft`, `--border-card-soft`
- Statuses: `--success`, `--error`, `--warning`, `--info`, `--standby`, appointment/status text tokens, purpose badge tokens
- Shadows: `--shadow-soft`
- Radius: `--radius-xl`, `--radius-lg`, `--radius-md`, `--radius-sm`, `--radius-field`, `--radius-pill`
- Overlays: `--overlay-backdrop`, snackbar tokens
- Dark surfaces: `--overlay-dark-strong`, `--surface-dark`, `--surface-dark-muted`, `--surface-black`
- Gradients: `--gradient-primary-start`, `--gradient-primary-end`, `--gradient-soft-start`, `--gradient-soft-end`, radial overlay tokens
- Typography scale: `--font-size-*`, `--line-height-*`, `--font-weight-*`
- Material overrides: MDC/Material form-field, option, and button variables in `:root`

## Typography Rules

- `h1`-`h6` sizes come from global typography tokens in `frontend/src/styles.scss`.
- `p`, `span`, `label`, `small`, `button`, `input`, `textarea`, and `select` should inherit the global font system.
- Component SCSS should not define heading font sizes unless it is a special visual case.
- Special cases include hero titles, stat numbers, badges, chips, chart labels, compact metadata, and marketing display headings.
- When a special case needs a local size, use the closest existing token instead of a hardcoded value.

## Component SCSS Rules

- Prefer existing `:root` tokens over hardcoded colors, font sizes, shadows, and radii.
- Do not use `::ng-deep`.
- Keep BEM-style SCSS nesting.
- Do not create new one-off color values unless absolutely necessary.
- Do not duplicate the typography scale inside components.
- Do not redesign unrelated components during cleanup.
- Do not change HTML bindings, Angular logic, or data flow during SCSS cleanup.

## Font Size Mapping

| Hardcoded value | Token |
|---|---|
| 0.6875rem | var(--font-size-overline) |
| 0.75rem | var(--font-size-caption) |
| 0.875rem | var(--font-size-body-sm) |
| 1rem | var(--font-size-body) |
| 1.125rem | var(--font-size-body-lg) |
| 1.25rem | var(--font-size-h4) |
| 1.5rem | var(--font-size-h3) |
| 2rem | var(--font-size-h2) |

## Usage Examples

Bad:

```scss
.card-title {
  font-size: 1.5rem;
  color: #124076;
  border-radius: 18px;
}
```

Good:

```scss
.card-title {
  font-size: var(--font-size-h3);
  color: var(--primary);
  border-radius: var(--radius-xl);
}
```

Bad:

```scss
.section h2 {
  font-size: 2rem;
  line-height: 1.2;
}
```

Good:

```scss
.section h2 {
  line-height: var(--line-height-heading);
}
```

## Instructions for AI Agents

- Before adding new styles, check whether a root token already exists.
- If a value is reused more than once, consider adding a token.
- If changing global tokens, check affected components visually.
- Do not add component-level heading sizes without a reason.
- Preserve the current visual intent.
- Prefer small token-based refactors over large rewrites.
- Leave comments only when a style is intentionally exceptional.

## Cleanup Notes

Some old token names may still exist for compatibility, for example:

- `--badge-accent-purple`
- `--badge-accent-teal`

Do not rename legacy tokens unless all usages are searched and updated safely.
