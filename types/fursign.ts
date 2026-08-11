export type ViewName =
  | "landing"
  | "projects"
  | "setup"
  | "editor"
  | "spec"
  | "recommendations"
  | "merchant";

export type FurnitureCategory =
  | "bed"
  | "sofa"
  | "table"
  | "chair"
  | "storage"
  | "shelf"
  | "side-table"
  | "decor";

export interface Door {
  id: string;
  wall: "north" | "east" | "south" | "west";
  offset: number;
  width: number;
  height: number;
  swing: "left" | "right";
}

export interface WindowOpening {
  id: string;
  wall: "north" | "east" | "south" | "west";
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
}

export interface Room {
  width: number;
  length: number;
  height: number;
  doors: Door[];
  windows: WindowOpening[];
}

export interface FurnitureAsset {
  id: string;
  name: string;
  category: FurnitureCategory;
  width: number;
  depth: number;
  height: number;
  color: string;
  thumbnail: string;
  modelUrl?: string;
  placementRules: string[];
}

export interface FurniturePlacement {
  id: string;
  assetId: string;
  x: number;
  z: number;
  rotation: number;
  locked: boolean;
}

export interface RoomWarning {
  id: string;
  placementId: string;
  type: "collision" | "outside" | "door" | "walkway";
  severity: "error" | "warning";
  message: string;
}

export interface Project {
  schemaVersion: 1;
  id: string;
  name: string;
  roomType: string;
  unit: "meter";
  budget: number;
  style: string;
  colorPreference: string;
  room: Room;
  placements: FurniturePlacement[];
  walkwayClearance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  contact: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  category: FurnitureCategory;
  width: number;
  depth: number;
  height: number;
  price: number;
  styleTags: string[];
  color: string;
  image: string;
  productUrl: string;
  inStock: boolean;
  sponsored: boolean;
  updatedAt: string;
}

export interface ProductRequirement {
  placementId: string;
  category: FurnitureCategory;
  label: string;
  maxWidth: number;
  maxDepth: number;
  maxHeight: number;
  budget: number;
  style: string;
  color: string;
}

export interface Recommendation {
  product: Product;
  fitScore: number;
  reasons: string[];
}

export interface AffiliateClick {
  clickId: string;
  projectId: string;
  productId: string;
  merchantId: string;
  timestamp: string;
  sourceSpec: string;
}

export interface User {
  id: string;
  displayName: string;
}

export interface Wall {
  id: string;
  start: [number, number];
  end: [number, number];
  height: number;
}
