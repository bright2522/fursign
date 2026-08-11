import assert from "node:assert/strict";
import test from "node:test";
import { boxesOverlap, calculateWarnings, doorSweepBox, generateRequirement, isOutsideRoom, metersToCentimeters, placementBox, recommendProducts } from "../lib/engine.mjs";
import { parseProjects, serializeProjects } from "../lib/storage.mjs";

const asset = { id: "sofa", name: "Sofa", category: "sofa", width: 2, depth: 1, height: .8, color: "#000", thumbnail: "", placementRules: ["floor"] };
const room = { width: 4, length: 5, height: 2.6, doors: [{ id: "door", wall: "north", offset: .8, width: .9, height: 2, swing: "right" }], windows: [] };
const baseProject = { schemaVersion: 1, id: "p", name: "Test", roomType: "living", unit: "meter", budget: 10000, style: "Minimal", colorPreference: "Beige", room, placements: [], walkwayClearance: .65, createdAt: "", updatedAt: "" };

test("converts units deterministically", () => assert.equal(metersToCentimeters(1.905), 191));
test("detects overlapping bounding boxes", () => assert.equal(boxesOverlap({ minX: 0, maxX: 1, minZ: 0, maxZ: 1 }, { minX: .8, maxX: 1.8, minZ: .2, maxZ: 1.2 }), true));
test("detects furniture outside the room", () => assert.equal(isOutsideRoom({ minX: -.1, maxX: 1, minZ: 0, maxZ: 1 }, room), true));
test("creates a door sweep and detects obstruction", () => {
  const sweep = doorSweepBox(room.doors[0], room);
  assert.equal(boxesOverlap(sweep, { minX: .5, maxX: 1.1, minZ: .1, maxZ: .6 }), true);
});
test("returns collision and door warnings", () => {
  const project = { ...baseProject, placements: [{ id: "a", assetId: "sofa", x: 1, z: .45, rotation: 0, locked: false }, { id: "b", assetId: "sofa", x: 1.4, z: .5, rotation: 0, locked: false }] };
  const warnings = calculateWarnings(project, [asset]);
  assert.ok(warnings.some((item) => item.type === "collision"));
  assert.ok(warnings.some((item) => item.type === "door"));
});
test("generates a measured product requirement", () => {
  const placement = { id: "a", assetId: "sofa", x: 2, z: 2.5, rotation: 0, locked: false };
  const requirement = generateRequirement({ ...baseProject, placements: [placement] }, placement, asset);
  assert.equal(requirement.category, "sofa");
  assert.ok(requirement.maxWidth >= asset.width);
});
test("hard-filters non-fitting sponsored products", () => {
  const requirement = { placementId: "a", category: "sofa", label: "Sofa", maxWidth: 2, maxDepth: 1, maxHeight: 1, budget: 10000, style: "Minimal", color: "Beige" };
  const products = [
    { id: "fit", merchantId: "m", name: "Fit", category: "sofa", width: 1.8, depth: .9, height: .8, price: 9000, styleTags: ["Minimal"], color: "Beige", image: "", productUrl: "", inStock: true, sponsored: false, updatedAt: "" },
    { id: "large", merchantId: "m", name: "Large sponsored", category: "sofa", width: 2.4, depth: 1.2, height: .8, price: 7000, styleTags: ["Minimal"], color: "Beige", image: "", productUrl: "", inStock: true, sponsored: true, updatedAt: "" },
  ];
  const results = recommendProducts(requirement, products, true);
  assert.deepEqual(results.map((item) => item.product.id), ["fit"]);
});
test("placement box honors object dimensions", () => {
  assert.deepEqual(placementBox({ id: "a", assetId: "sofa", x: 2, z: 2, rotation: 0, locked: false }, asset), { minX: 1, maxX: 3, minZ: 1.5, maxZ: 2.5 });
});
test("saves and loads a versioned project without data loss", () => {
  const encoded = serializeProjects([baseProject]);
  assert.deepEqual(parseProjects(encoded), [baseProject]);
});
