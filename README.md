# Impact — registration page

Static, framework-free HTML/CSS/TypeScript implementation of the supplied Figma design.

## Run

Node.js 22+ is recommended.

```sh
npm ci
npm run build
npm run preview
npm.cmd run build
npm.cmd run preview
```

Open http://localhost:4173. The included `dist/` is already compiled and can be served by any static HTTP server. Use HTTP rather than opening index.html through file:// so browser ES modules work. No backend or environment variables are required. All images and fonts are local.

## Source organization

| Path | Purpose |
| --- | --- |
| `index.html` | Semantic registration markup, shared navigation and footer |
| `src/styles/tokens.css` | Authoritative reusable color, typography, radius and spacing tokens |
| `src/styles/fonts.css` | Self-hosted Manrope font faces |
| `src/styles/base.css` | Reset, typography and accessibility utilities |
| `src/styles/components.css` | Reusable buttons, fields and consent controls |
| `src/styles/layout.css` | Shared desktop/mobile navigation and footer |
| `src/pages/registration/registration.css` | Registration-specific layout |
| `src/pages/registration/registration.ts` | Form binding and local validation |
| `src/services/registration.ts` | Typed registration interface and backend stub |
| `src/shared/navigation.ts` | Future routes and external-service stubs |
| `public/assets/` | Exact exported Figma logo and self-hosted fonts |
| `scripts/` | Static build and local preview server |
| `docs/design-tokens.md` | Token reference and Figma provenance |
| `dist/` | Prebuilt static output |

## Stub behavior

Inputs and checkboxes work locally. Native browser validation checks required fields, email format, consent and the 12-character password minimum. Valid submissions call the typed stub, which returns `status: 'stub'`. It never creates an account or makes a network request. No user data is logged or persisted.

All navigation, legal, contact and social links are intercepted. They emit an `impact:navigation-stub` event containing only a destination name. Submission emits `impact:registration-stub` with the stub result, without credentials. An offscreen live region announces stub messages without introducing UI absent from the design. No success screen or alert dialog is invented.

Replace the adapter in `src/services/registration.ts` to connect a backend; replace navigation stubs with actual routes as pages are implemented. Server-side validation and authentication belong to that future backend.

## Extend the project

Keep global primitives in `src/styles/` and page-specific CSS and TypeScript in `src/pages/<page>/`. Add login, news, schedule, events and instructors only as their layouts are implemented. Keep network adapters in `src/services/` and share types with those adapters. A future multi-page build can copy additional HTML entry points in `scripts/build.mjs`; no framework migration is required. Generated `.build/` and `dist/` should not be edited by hand.

## Design fidelity

Source: https://www.figma.com/design/HyyhOg5nX6Qb6TbsYFpIbT/Impact?node-id=2-182

Desktop registration: `2:182`, 1440 × 1246. Mobile registration: `26:257`, 390 × 1191. The implementation uses actual component-instance overrides, including the desktop 50px registration actions, 46px inputs and #D9D9D9 input border. Manrope weights are 400, 500 and 700. The Figma logo is exported directly; embedded colors within that image remain untouched.

The 390px Figma navigation extends its Konto button by 2px beyond the frame. This intentional source clipping is preserved at the reference width. Below 390px only horizontal header spacing flexes to keep the controls usable. Intermediate-width behavior is an implementation interpolation: mobile navigation/footer below 1280px, mobile form below 768px. The two supplied reference layouts retain their original measurements. Browser font rasterization can differ slightly from Figma.

Font license: `public/assets/fonts/OFL.txt` (SIL Open Font License). Logo rights remain with its owner.
