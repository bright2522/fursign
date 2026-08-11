export const metersToCentimeters = (value) => Math.round(value * 100);

export const normalizeRotation = (value) => ((value % 360) + 360) % 360;

export function rotatedFootprint(asset, rotation) {
  const radians = (normalizeRotation(rotation) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return {
    width: asset.width * cos + asset.depth * sin,
    depth: asset.width * sin + asset.depth * cos,
  };
}

export function placementBox(placement, asset) {
  const footprint = rotatedFootprint(asset, placement.rotation);
  return {
    minX: placement.x - footprint.width / 2,
    maxX: placement.x + footprint.width / 2,
    minZ: placement.z - footprint.depth / 2,
    maxZ: placement.z + footprint.depth / 2,
  };
}

export function boxesOverlap(a, b, padding = 0) {
  return !(
    a.maxX + padding <= b.minX ||
    a.minX - padding >= b.maxX ||
    a.maxZ + padding <= b.minZ ||
    a.minZ - padding >= b.maxZ
  );
}

export function isOutsideRoom(box, room) {
  return box.minX < 0 || box.minZ < 0 || box.maxX > room.width || box.maxZ > room.length;
}

export function doorSweepBox(door, room) {
  const half = door.width / 2;
  if (door.wall === "north") {
    return { minX: door.offset - half, maxX: door.offset + half, minZ: 0, maxZ: door.width };
  }
  if (door.wall === "south") {
    return { minX: door.offset - half, maxX: door.offset + half, minZ: room.length - door.width, maxZ: room.length };
  }
  if (door.wall === "west") {
    return { minX: 0, maxX: door.width, minZ: door.offset - half, maxZ: door.offset + half };
  }
  return { minX: room.width - door.width, maxX: room.width, minZ: door.offset - half, maxZ: door.offset + half };
}

export function calculateWarnings(project, assets) {
  const warnings = [];
  const boxes = project.placements.map((placement) => ({
    placement,
    box: placementBox(placement, assets.find((asset) => asset.id === placement.assetId)),
  }));

  boxes.forEach(({ placement, box }, index) => {
    if (isOutsideRoom(box, project.room)) {
      warnings.push({ id: `outside-${placement.id}`, placementId: placement.id, type: "outside", severity: "error", message: "เฟอร์นิเจอร์อยู่นอกขอบเขตห้อง" });
    }
    project.room.doors.forEach((door) => {
      if (boxesOverlap(box, doorSweepBox(door, project.room))) {
        warnings.push({ id: `door-${door.id}-${placement.id}`, placementId: placement.id, type: "door", severity: "error", message: "กีดขวางพื้นที่เปิดประตู" });
      }
    });
    boxes.slice(index + 1).forEach((other) => {
      if (boxesOverlap(box, other.box)) {
        warnings.push({ id: `collision-${placement.id}-${other.placement.id}`, placementId: placement.id, type: "collision", severity: "error", message: "เฟอร์นิเจอร์ชนกับวัตถุอื่น" });
        warnings.push({ id: `collision-${other.placement.id}-${placement.id}`, placementId: other.placement.id, type: "collision", severity: "error", message: "เฟอร์นิเจอร์ชนกับวัตถุอื่น" });
      } else if (boxesOverlap(box, other.box, project.walkwayClearance)) {
        warnings.push({ id: `walkway-${placement.id}-${other.placement.id}`, placementId: placement.id, type: "walkway", severity: "warning", message: `ทางเดินแคบกว่าค่าแนะนำ ${metersToCentimeters(project.walkwayClearance)} ซม.` });
      }
    });
  });
  return warnings;
}

export function generateRequirement(project, placement, asset) {
  const left = placement.x;
  const right = project.room.width - placement.x;
  const front = placement.z;
  const back = project.room.length - placement.z;
  const maxWidth = Math.max(asset.width, Math.min(left, right) * 2 - 0.1);
  const maxDepth = Math.max(asset.depth, Math.min(front, back) * 2 - 0.1);
  return {
    placementId: placement.id,
    category: asset.category,
    label: asset.name,
    maxWidth: Number(maxWidth.toFixed(2)),
    maxDepth: Number(maxDepth.toFixed(2)),
    maxHeight: Number(Math.min(project.room.height - 0.1, Math.max(asset.height, asset.height * 1.25)).toFixed(2)),
    budget: Math.max(0, Math.floor(project.budget / Math.max(1, project.placements.length))),
    style: project.style,
    color: project.colorPreference,
  };
}

export function recommendProducts(requirement, products, budgetConstraint = true) {
  return products
    .filter((product) => product.inStock && product.category === requirement.category)
    .filter((product) => product.width <= requirement.maxWidth && product.depth <= requirement.maxDepth && product.height <= requirement.maxHeight)
    .filter((product) => !budgetConstraint || product.price <= requirement.budget)
    .map((product) => {
      const sizeDelta = Math.abs(requirement.maxWidth - product.width) + Math.abs(requirement.maxDepth - product.depth);
      const sizeScore = Math.max(0, 62 - sizeDelta * 18);
      const styleMatch = product.styleTags.some((tag) => tag.toLowerCase() === requirement.style.toLowerCase());
      const colorMatch = product.color.toLowerCase() === requirement.color.toLowerCase();
      const valueScore = requirement.budget ? Math.max(0, 10 - (product.price / requirement.budget) * 10) : 5;
      const sponsoredBoost = product.sponsored ? 3 : 0;
      const fitScore = Math.min(99, Math.round(sizeScore + (styleMatch ? 20 : 6) + (colorMatch ? 8 : 3) + valueScore + sponsoredBoost));
      const reasons = ["ขนาดผ่านเงื่อนไขพื้นที่จริง", styleMatch ? `เข้ากับสไตล์ ${requirement.style}` : "สัดส่วนเหมาะกับพื้นที่", product.price <= requirement.budget ? "อยู่ในงบประมาณต่อชิ้น" : "เกินงบที่ตั้งไว้"];
      return { product, fitScore, reasons };
    })
    .sort((a, b) => b.fitScore - a.fitScore || Number(a.product.sponsored) - Number(b.product.sponsored));
}

export function createId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
