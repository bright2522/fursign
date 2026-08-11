# Architecture and data flow

## Runtime shape

The UI is a vinext/React application deployed as a Cloudflare-compatible Worker. The prototype deliberately uses browser storage because the product brief requires it to work without credentials. Persistence is isolated behind versioned serialization functions so it can be replaced with a remote repository later.

The editor renders a Three.js/WebGL scene with real floor geometry, upright cutaway walls, door/window panels, and 24 lightweight FBX furniture models supplied with the project. Furniture positions are stored in room coordinates measured in meters. Raycasting maps pointer movement directly onto the floor plane, while visual transforms never mutate the room coordinate system.

## Deterministic geometry

`lib/engine.mjs` is independent from React. It converts a placement plus asset dimensions into an axis-aligned footprint that accounts for rotation, then checks:

1. furniture-to-furniture bounding-box overlap;
2. room boundary overflow;
3. overlap with a door-sweep zone;
4. proximity within the user-adjustable walkway recommendation.

The same layer calculates maximum product dimensions around a placed generic object and hard-filters recommendation candidates. Sponsored products never bypass category, stock, dimensions, or budget rules.

## Data flow

```text
Room setup / imported JSON
          ↓
Versioned Project state ──→ localStorage repository
          ↓
Placement interaction ──→ geometry warnings
          ↓
Measured product requirements
          ↓
Hard filter (category, dimensions, stock, optional budget)
          ↓
Soft rank (size, style, color, value, eligible sponsored boost)
          ↓
Outbound click record ──→ localStorage prototype analytics
```

## Data contract

TypeScript contracts cover User, Project, Room, Wall, Door, WindowOpening, FurnitureAsset, FurniturePlacement, RoomWarning, Product, Merchant, ProductRequirement, Recommendation, and AffiliateClick. Exported projects use `schemaVersion: 1`, `unit: "meter"`, a room object, and placements.

## Repository replacement path

Keep UI callers dependent on project operations rather than storage APIs. A hosted repository can implement the same operations with Supabase or another backend. Add migration validation by `schemaVersion`; do not silently coerce unknown scan payloads.

## Performance choices

- No Three.js payload is loaded on the landing page or editor.
- The initial library uses 24 compact low-poly FBX files (under 1 MB combined) and caches each source model in memory.
- Camera motion changes a single world transform.
- Geometry runs only when project placements or settings change.
- The mock catalog is small and local.
