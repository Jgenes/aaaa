# TrainHub TZ

Tanzania's professional training marketplace — learners discover accredited,
cohort-based trainings from verified providers; providers publish courses,
cohorts and track enrolments, payments and reports.

> **Elevating Skills. Transforming Tanzania.**

## Stack

| Layer      | Choice                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | React 18 + Vite 7 (`@vitejs/plugin-react`)                                |
| Routing    | `react-router-dom` v7 (client-side routes defined in `src/App.jsx`)       |
| Styling    | CSS design-token system layered on top of Bootstrap 5.3                   |
| Icons      | Bootstrap Icons (loaded from the npm package, not a CDN)                  |
| Data       | `axios` instance in `src/api/axio.js` (Bearer token → Laravel-style API)  |
| Charts     | `chart.js` + `react-chartjs-2`, `recharts`                                |
| Tables     | `react-data-table-component` (admin/provider dashboards)                  |
| Feedback   | `react-toastify`                                                          |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # preview the production build
npm run lint       # eslint
npm run test:ui    # headless route smoke test (see below)
```

The API base URL lives in `src/api/axio.js`. Requests to `/api` are proxied to
`http://localhost:5174` during development (`vite.config.js`).

## Design system

All visual decisions are expressed as tokens and shared layers so pages stay
consistent. They are imported once, in order, from `src/index.css`:

```
src/styles/tokens.css      colour, type, spacing, radius, elevation, motion
src/styles/base.css        reset, typography, layout primitives, a11y helpers
src/styles/components.css  buttons, forms, cards, tables, modals, navigation…
src/styles/marketing.css   public header/footer, hero, course cards, auth, pages
src/styles/dashboard.css   provider & admin application shell
src/styles/provider.css    provider screen-level classes (tables, forms, modals)
src/lib/tableStyles.js     shared react-data-table-component theme
src/App.css                legacy aliases + shared page styles (single source)
```

### Visual language (v2 — editorial)

| Aspect | Decision |
| --- | --- |
| Canvas | warm paper `#f6f4ef` alternating with white sections, separated by 1px hairlines |
| Actions | ink navy `#0b1d33` solid buttons; orange `#e07a1f` used only for accent rules, active markers and highlights |
| Type | *Plus Jakarta Sans* display at tight tracking (`-0.035em`) for headlines, *Inter* for UI text; micro labels are 11px uppercase with `0.16em` tracking |
| Shape | 2–6px radii on cards and inputs, 10px on modals and the CTA band; no oversized rounded cards |
| Depth | borders do the work; shadows appear only on overlays, sticky panels and hovered cards |
| Density | 4px spacing scale, fluid section rhythm (`--th-section-y`), 66ch measure for prose |
| Motion | 160ms colour/border transitions; no decorative animation; `prefers-reduced-motion` disables all of it |

Key conventions:

- **Brand palette** is sampled from the logo: navy `#124a8f` (links),
  green `#358a50` (success), orange `#e07a1f` (accent), plus a neutral
  ink / line / paper scale.
- Prefer tokens over literal values: `var(--th-ink)`, `var(--th-paper)`,
  `var(--th-radius-sm)`, `var(--th-shadow-md)`…
- Bootstrap components are re-themed through their CSS custom properties in
  `components.css`, so plain Bootstrap markup picks up the design system.
- Dashboard screens share `DashboardShell`; provider screens additionally use
  `provider.css` classes instead of per-page `<style>` blocks.
- Contrast: body copy 9.9:1, muted copy 6.9:1, placeholders 5.4:1, white on ink
  17:1 — all above WCAG 2.2 AA for their text size.

### Reusable UI pieces

| Component             | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `components/NavBar`   | Public header: nav, search, account menu, mobile drawer      |
| `components/Footer`   | Structured sitemap footer with contact + socials             |
| `components/CourseCard` | Shared course tile (home + catalogue)                      |
| `components/AuthLayout` | Two-column shell for login/register/OTP                    |
| `components/DashboardShell` | Sidebar + topbar shell for provider/admin dashboards  |
| `components/CourseContentSideBar` | Lesson list with progress                      |
| `components/ReviewModal` | Accessible rating dialog                                 |

Accessibility notes: every page exposes a `main` landmark, a “Skip to main
content” link lives in `index.html`, focus rings are visible on keyboard
navigation, dialogs support <kbd>Esc</kbd>, and `prefers-reduced-motion` is
respected globally.

## Route smoke test

`npm run test:ui` builds the production bundle, re-wraps it as an IIFE and
executes it in **jsdom** for every route in `src/App.jsx`. It fails if the app
does not mount, renders an empty screen, or logs a React warning / runtime
error. Network calls are stubbed to fail fast, so the test is hermetic.

Run `AUDIT=1 npm run test:ui` for a structural report per route: heading
count, missing `alt` text, unnamed controls, duplicate ids, unlabelled form
fields and inline-style count.

Chart screens are excluded from chart-rendering assertions because jsdom has no
`<canvas>` implementation — everything else is asserted.

## Deployment

Netlify: `netlify.toml` builds `dist/`; `public/_redirects` provides the SPA
fallback so deep links resolve to `index.html`.
