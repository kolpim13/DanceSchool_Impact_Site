# Impact website: backend API contract

## Website pages design
- design fidelity https://www.figma.com/design/HyyhOg5nX6Qb6TbsYFpIbT/Impact-%E2%80%94-Dance-Studio-Website?node-id=133-455&p=f&m=dev

## Ownership
- This repository contains the TypeScript/HTML/CSS website.
- The backend owns routes, request/response schemas, authentication and authorization.
- Use contracts/openapi.json as the authoritative API interface for the pinned backend revision.
- Read contracts/backend-version.txt for provenance. If absent, report missing provenance; never invent a revision.
- Never modify backend code, database models, or migrations as a workaround for a frontend task unless explicitly instructed.

## Before API work
1. Read the relevant paths, methods, parameters, request bodies, responses and referenced component schemas in contracts/openapi.json.
2. Compare the supplied contract update with the previous committed contract when available.
3. Run npm run api:generate after a contract update.
4. Inspect existing API client, authentication handling, UI conventions and package scripts before implementing changes.
5. If the contract is missing or lacks a required endpoint, report the specific missing capability. Do not invent endpoints or silently use a live server's schema instead.

## Contract synchronization
- Adopt a new contract only when the task supplies or requests a backend revision/update.
- Keep the downloaded/copied contract unchanged. Never hand-edit it to accommodate frontend code.
- Record the actual backend revision in contracts/backend-version.txt. If using an uncommitted local export, explicitly record that fact instead of claiming it matches a clean commit.
- Commit contract, provenance, generated types and related frontend changes together.
- Normal builds use the committed contract; do not fetch the latest backend automatically on every build.

## Implementation
- Generate src/api/generated/schema.d.ts using openapi-typescript. Never edit generated types manually.
- Use one typed openapi-fetch client in src/api/client.ts. Reuse the existing client if one is already configured.
- Put reusable feature API calls under src/api/. Avoid duplicating transport/auth logic in pages.
- Derive API types from generated paths/components. Do not maintain handwritten copies of API DTOs.
- Do not bypass mismatches with any, @ts-ignore or unsafe assertions.
- Follow exact paths, HTTP methods, parameter names, nullable/optional distinctions and documented response status codes.
- Handle loading, empty, error and successful states, plus network failures.
- Render API text safely using textContent or the framework's normal escaped rendering.
- Public school-profile responses include photo_path; handle null. File serving/upload support must be verified, not inferred from the field's presence.
- Treat role checks in the UI as presentation only. Backend authorization remains authoritative.
- Do not invent login/session behavior. Consult backend documentation when authentication is missing or ambiguous in the contract.
- For synchronization tasks, update affected existing features. Add new UI only when requested by product requirements; a new endpoint alone does not define a UI requirement.

## Authentication And Session Flow
- Login uses `POST /api/auth/login` with a JSON body containing `login_email` and `password`.
- The backend verifies credentials and returns `AccountRead`; it also sets the `impact_session` cookie. The raw session token is never returned in JSON.
- Send login and all authenticated API requests with `credentials: 'include'` so the browser stores and sends the `HttpOnly` session cookie. Do not read, copy, persist, or recreate the cookie in JavaScript, localStorage, sessionStorage, URL parameters, or application state.
- Use `GET /api/people/me` to load the signed-in account's personal information. Do not construct this request from a user-entered or client-stored `person_id`.
- Treat `401` responses as an unauthenticated session: clear in-memory user state and route to the login UI. Do not retry indefinitely or expose whether an email exists.
- Treat account roles and any UI visibility derived from them as presentation hints only; the backend remains authoritative for authorization and may return `403`.
- Preserve the browser's cookie policy. Do not add `Authorization: Bearer` headers, token refresh logic, or client-side logout token handling unless the backend contract explicitly introduces those mechanisms.

## Verification
- Run npm run api:generate, npm run typecheck and npm run build using the repository's configured scripts.
- If a required script is missing, implement an appropriate one after inspecting the project, or report the precise blocker.
- Run focused tests for changed behavior. When a backend is available, test the affected endpoint and browser flow.
- Report schema-only verification separately from live integration verification. Generated types do not provide runtime response validation or prove that the deployed backend matches the contract.
- Keep dependency versions reproducible through package-lock.json and npm ci in CI.
- CI should regenerate API types and fail if committed generated output differs. CI should also run type checking and the build.

## Completion report
State the adopted backend revision, API paths used, changed UI behavior, checks run and unresolved contract/backend limitations.
