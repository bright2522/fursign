# Fursign

Fursign is a Thai-first browser prototype for planning a room before buying furniture. It turns real room dimensions into an interactive 3D-style workspace, checks deterministic geometry rules, creates product requirements, and recommends only mock products that fit.

## Run locally

Requirements: Node.js 24 and pnpm 10.34.5.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by the development server.

## Verify

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm test
```

## Main flow

1. Open the Thai landing page and choose **เริ่มออกแบบห้อง**.
2. Enter room dimensions, budget, style, door position, and an optional window, or import versioned Room JSON.
3. Add furniture in the WebGL Editor. Drag FBX objects directly under the pointer, orbit/pan/zoom the room, rotate by 15° or 90°, and inspect collision/door warnings.
4. Save the project locally and open **สร้างสเปกสินค้า**.
5. Select the positions that represent products to buy and review maximum measured dimensions.
6. Open recommendations. Category, dimensions, stock, and optional budget are hard filters; sponsored status is only a small boost after fit.
7. An outbound store click is recorded locally as a prototype event. It is not a confirmed purchase.

## Architecture

- `app/` — application entry and global visual system
- `components/` — landing, project, setup, editor, specification, recommendation, and merchant views
- `features/projects/` — shared project state, history, and local persistence
- `lib/engine.mjs` — deterministic geometry, warnings, specification, and recommendation scoring
- `lib/storage.mjs` — versioned project serialization
- `data/catalog.ts` — 24 generic furniture assets, 30 mock products, and a demo project
- `types/` — Fursign data contracts
- `tests/` — geometry, recommendation, persistence, and rendered HTML checks
- `docs/` — product, technical, validation, and integration evidence

## Data and privacy

This prototype requires no account, API key, or secret. Projects, merchant submissions, favorites, and click events stay in browser local storage on the current device. Clearing browser storage removes them.

## Documentation

- [Product overview](docs/product-overview.md)
- [Architecture and data flow](docs/architecture.md)
- [Testing and validation templates](docs/testing-and-validation.md)
- [Integration plans and known limitations](docs/integration-plans.md)
- [Example merchant CSV](docs/merchant-products-example.csv)
