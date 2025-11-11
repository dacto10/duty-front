
---

# Duties App

**Hosted on Vercel:** [https://duty-front.vercel.app](https://duty-front.vercel.app)

This repository contains a small React + TypeScript front-end for managing “duties”. The UI is built with Ant Design and talks to a REST API via Axios. Data shape and client-side DTO validation are modeled with Zod. A minimal end-to-end API test suite (Jest) exercises the CRUD flow.

---

## High-Level Architecture

* **Frontend framework:** React (TypeScript).
* **UI library:** Ant Design (`antd`) with icons from `@ant-design/icons`.
* **HTTP client:** Axios, configured via a single `api` instance.
* **Validation & types:** Zod (`zod`) for runtime schema validation and TypeScript type inference.
* **State management:** Local component state and a small reducer for fetch lifecycle (`src/state/duty.reducer.ts`).
* **URL state:** A custom hook (`src/hooks/usePath.ts`) that reads and updates `page` and `pageSize` through the browser location (query string), using `pushState` / `popstate`.
* **Testing:** Jest test using the exported API client functions to validate a real(istic) CRUD flow against `/duties` endpoints.

---

## Folder Structure

```
.
├─ src/
│  ├─ api/
│  │  ├─ client.ts
│  │  ├─ duties.api.ts
│  │  └─ index.ts
│  ├─ components/
│  │  ├─ DutyFormModal.tsx
│  │  └─ index.tsx
│  ├─ hooks/
│  │  └─ usePath.ts
│  ├─ pages/
│  │  ├─ DutyPage.tsx
│  │  └─ index.tsx
│  ├─ schemas/
│  │  ├─ duty.schema.ts
│  │  └─ index.ts
│  ├─ state/
│  │  ├─ duty.reducer.ts
│  │  └─ index.ts
│  ├─ utils/
│  │  ├─ index.ts
│  │  └─ types.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ tests/
│  └─ duties.e2e.test.ts
└─ index.html
```

### `index.html`

Vite-style single page entry that mounts the application at `#root` and loads `/src/main.tsx`.

### `src/main.tsx`

Bootstraps React (StrictMode) and renders the root `<App />` component. Imports global styles from `src/index.css`.

### `src/App.tsx`

Top-level composition with `antd`’s `ConfigProvider` and `App` context. Sets the primary Ant Design color token and renders the `DutiesPage`.

### `src/pages/DutyPage.tsx`

Feature page that displays and manages the list of duties:

* Loads paginated data via `listDuties(page, pageSize)`.
* Uses `useReducer` with `dutyReducer` to manage loading/error/data states.
* Synchronizes pagination with the URL using `usePath()` (reads `page` and `pageSize`, pushes updates to the query string, and listens to `popstate`).
* Provides create/update flows through the `DutyFormModal`.
* Supports delete with confirmation (`Popconfirm`) and shows success/error feedback via `AntApp.useApp().message`.
* Uses Ant Design `Table` to render items; columns include **Name** and **Actions** (Edit/Delete).

### `src/components/DutyFormModal.tsx`

Controlled modal form for creating or editing a duty:

* Implements an Ant Design `Form` with a single `name` field.
* Validates input using the `ZDutyDTO` Zod schema (required, trimmed string, max 255 characters).
* Accepts `open`, `initial`, `onCancel`, `onSubmit`, `title`, `confirmText`, and `submitting` props.

### `src/hooks/usePath.ts`

Encapsulates URL <-> state synchronization for pagination:

* Parses `page` and `pageSize` from `window.location.search` (with safe defaults).
* Exposes setters (`setPage`, `setPageSize`, `setQuery`) that update the URL using `history.pushState`.
* Listens to `popstate` to keep state in sync when navigating back/forward.

### `src/api/client.ts`

Creates a preconfigured Axios instance:

* **Base URL:** `import.meta.env.VITE_API_BASE ?? "http://localhost:8080"`
* **Headers:** `Content-Type: application/json`

### `src/api/duties.api.ts`

Typed API helpers targeting a REST backend:

* `listDuties(page: number, pageSize: number) => Promise<Paginated<Duty>>` → `GET /duties` with `page` and `pageSize` query params.
* `createDuty(name: string) => Promise<Duty>` → `POST /duties` with JSON body `{ name }`.
* `updateDuty(id: string, name: string) => Promise<Duty>` → `PUT /duties/{id}` with JSON body `{ name }`.
* `deleteDuty(id: string) => Promise<void>` → `DELETE /duties/{id}`.

### `src/schemas/duty.schema.ts`

Zod models for runtime validation and TypeScript inference:

* `ZDuty`: `{ id: uuid, name: string (1..255) }`
* `ZDutyDTO`: `ZDuty` without `id` (payload for create/update)
* `Duty`, `DutyDTO` types derived from the schemas.

### `src/state/duty.reducer.ts`

Minimal reducer and initial state used by the page:

* `initialFetchState`: `{ loading: false, error: null, data: null }`
* `dutyReducer`: handles `"LOAD_START" | "LOAD_SUCCESS" | "LOAD_ERROR"` actions with `FetchState` and `Paginated<Duty>` payloads (see `src/utils/types.ts`).

### `src/utils/types.ts`

Shared types:

* `Paginated<T>`: `{ items, total, page, pageSize, totalPages }`
* `FetchState`: `{ loading, error, data }`
* `FetchAction`: discriminated union for the fetch reducer.

### `tests/duties.e2e.test.ts`

Jest-based API flow test (using `@jest/globals`):

* Imports the same `api` instance and CRUD helpers from `src/api` to run against the configured base URL.
* Generates unique entity names with `node:crypto` `randomBytes`.
* Exercises: **create → list (with pagination) → update → delete**, and verifies visibility across list operations.
* Uses a retry helper named `eventually(...)` (invoked with `{ timeoutMs, intervalMs }`) around network calls.

> **Note:** The test suite depends on the backend being reachable at the Axios base URL. By default, that is `http://localhost:8080` unless `VITE_API_BASE` is set (see `src/api/client.ts`).

---

## Data Contracts (as used by the frontend)

* **Duty (read model):**

  ```ts
  type Duty = {
    id: string;      // UUID
    name: string;    // 1..255 chars
  }
  ```

* **Create/Update payload (DTO):**

  ```ts
  type DutyDTO = {
    name: string;
  }
  ```

* **Paginated response:**

  ```ts
  type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  ```

* **Endpoints used by the client:**

  * `GET /duties?page={page}&pageSize={pageSize}` → `Paginated<Duty>`
  * `POST /duties` body `{ name }` → `Duty`
  * `PUT /duties/{id}` body `{ name }` → `Duty`
  * `DELETE /duties/{id}` → void

---

## Test Strategy

* **Scope:** Black-box tests at the API boundary from the perspective of the frontend client code (no UI automation).
* **Approach:** Use the exported Axios instance and helper functions to perform real HTTP calls against the `/duties` routes, validating system behavior end-to-end.
* **Stability aids:** Calls that rely on eventual consistency or network scheduling are wrapped with an `eventually(...)` utility in the test to poll with a small interval until a timeout.
* **Data isolation:** Each run creates uniquely named duties via a random suffix to avoid collisions across runs.
* **Assertions:** Validate payload shapes (items arrays, page limits), presence/absence of created resources in listings, and successful mutation cycles (create → update → delete).

---

## Environment Configuration (frontend)

* `VITE_API_BASE` — optional; if set, becomes the Axios base URL used by both the app and tests. If not set, the app and tests default to `http://localhost:8080`.

---

## UI/UX Notes

* The primary color token for Ant Design is customized to `#1677ff` via `ConfigProvider`.
* Table pagination state is synchronized with the URL query string, enabling shareable and navigable state (`page`, `pageSize`).
* Create/Update flows are handled in a modal with client-side validation errors displayed beneath the form when Zod validation fails.
