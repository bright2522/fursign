import type { FurnitureAsset, Product, Project } from "@/types/fursign";

const asset = (
  id: string,
  name: string,
  category: FurnitureAsset["category"],
  width: number,
  depth: number,
  height: number,
  color: string,
  thumbnail: string,
  placementRules: string[] = ["floor"],
): FurnitureAsset => ({ id, name, category, width, depth, height, color, thumbnail, placementRules });

export const furnitureAssets: FurnitureAsset[] = [
  asset("bed-queen", "เตียงควีน", "bed", 1.6, 2, 0.55, "#caa98e", "เตียง"),
  asset("bed-single", "เตียงเดี่ยว", "bed", 1, 2, 0.5, "#d8b99d", "เตียง"),
  asset("bed-platform", "เตียงแพลตฟอร์ม", "bed", 1.8, 2.1, 0.42, "#9d7558", "เตียง"),
  asset("sofa-2", "โซฟา 2 ที่นั่ง", "sofa", 1.6, 0.82, 0.82, "#5f766c", "โซฟา"),
  asset("sofa-3", "โซฟา 3 ที่นั่ง", "sofa", 2.15, 0.9, 0.85, "#8d765f", "โซฟา"),
  asset("sofa-love", "เลิฟซีท", "sofa", 1.35, 0.78, 0.8, "#b77762", "โซฟา"),
  asset("table-dining", "โต๊ะอาหาร", "table", 1.6, 0.85, 0.75, "#926b4d", "โต๊ะ"),
  asset("table-work", "โต๊ะทำงาน", "table", 1.2, 0.6, 0.75, "#ad8768", "โต๊ะ"),
  asset("table-coffee", "โต๊ะกลาง", "table", 1.05, 0.55, 0.42, "#b99374", "โต๊ะ"),
  asset("chair-dining", "เก้าอี้อาหาร", "chair", 0.48, 0.52, 0.82, "#d2ae8c", "เก้าอี้"),
  asset("chair-lounge", "เก้าอี้พักผ่อน", "chair", 0.72, 0.78, 0.86, "#d59872", "เก้าอี้"),
  asset("chair-office", "เก้าอี้ทำงาน", "chair", 0.62, 0.62, 0.96, "#4f5b59", "เก้าอี้"),
  asset("wardrobe-2", "ตู้เสื้อผ้า 2 บาน", "storage", 1.2, 0.58, 2, "#d7c2a8", "ตู้"),
  asset("wardrobe-3", "ตู้เสื้อผ้า 3 บาน", "storage", 1.8, 0.6, 2.1, "#b49172", "ตู้"),
  asset("cabinet-low", "ตู้เตี้ย", "storage", 1.4, 0.42, 0.72, "#806b57", "ตู้"),
  asset("shelf-tall", "ชั้นวางทรงสูง", "shelf", 0.82, 0.34, 1.9, "#9f7c5b", "ชั้น"),
  asset("shelf-wide", "ชั้นวางแนวกว้าง", "shelf", 1.6, 0.36, 1.2, "#bd9876", "ชั้น"),
  asset("shelf-ladder", "ชั้นวางบันได", "shelf", 0.72, 0.4, 1.55, "#c5a78c", "ชั้น"),
  asset("side-round", "โต๊ะข้างทรงกลม", "side-table", 0.45, 0.45, 0.52, "#b87852", "โต๊ะข้าง"),
  asset("side-drawer", "โต๊ะข้างมีลิ้นชัก", "side-table", 0.5, 0.42, 0.55, "#d0af92", "โต๊ะข้าง"),
  asset("side-cube", "โต๊ะข้างทรงกล่อง", "side-table", 0.4, 0.4, 0.42, "#87958c", "โต๊ะข้าง"),
  asset("lamp-floor", "โคมไฟตั้งพื้น", "decor", 0.38, 0.38, 1.55, "#d0a94c", "โคมไฟ", ["floor", "near-wall"]),
  asset("plant-large", "ต้นไม้กระถาง", "decor", 0.52, 0.52, 1.2, "#71836a", "ต้นไม้"),
  asset("ottoman", "สตูลวางเท้า", "decor", 0.58, 0.46, 0.42, "#bf8c75", "สตูล"),
];

const productNames = [
  "Nara", "Sora", "Mori", "Ari", "Ploen", "Lanna", "Siam", "Rin", "Kiri", "Chaba",
  "Loom", "Tana", "Mellow", "Mono", "Haven", "Rattan", "Sunday", "Cove", "Terra", "Baan",
  "Aster", "Nook", "Mali", "Wabi", "Hue", "Craft", "Linen", "Dune", "Raya", "Calm",
];

export const products: Product[] = productNames.map((label, index) => {
  const source = furnitureAssets[index % 21];
  const scale = 0.82 + (index % 5) * 0.045;
  const styles = ["Minimal", "Japandi", "Modern", "Natural"];
  const colors = ["Beige", "Oak", "Sage", "Terracotta"];
  return {
    id: `product-${index + 1}`,
    merchantId: `merchant-${(index % 5) + 1}`,
    name: `${source.name} ${label}`,
    category: source.category,
    width: Number((source.width * scale).toFixed(2)),
    depth: Number((source.depth * scale).toFixed(2)),
    height: Number((source.height * (0.92 + (index % 3) * 0.035)).toFixed(2)),
    price: 1890 + index * 630,
    styleTags: [styles[index % styles.length], index % 2 ? "Warm" : "Clean"],
    color: colors[index % colors.length],
    image: source.thumbnail,
    productUrl: `https://example.com/fursign/${index + 1}`,
    inStock: index % 9 !== 0,
    sponsored: index % 7 === 1,
    updatedAt: "2026-08-01T08:00:00.000Z",
  };
});

export const demoProject: Project = {
  schemaVersion: 1,
  id: "demo-living-room",
  name: "ห้องนั่งเล่นตัวอย่าง",
  roomType: "ห้องนั่งเล่น",
  unit: "meter",
  budget: 45000,
  style: "Minimal",
  colorPreference: "Beige",
  room: {
    width: 4.6,
    length: 5.2,
    height: 2.7,
    doors: [{ id: "door-main", wall: "north", offset: 0.75, width: 0.9, height: 2, swing: "right" }],
    windows: [{ id: "window-main", wall: "west", offset: 3, width: 1.6, height: 1.2, sillHeight: 0.8 }],
  },
  placements: [
    { id: "demo-sofa", assetId: "sofa-3", x: 2.25, z: 4.15, rotation: 0, locked: false },
    { id: "demo-table", assetId: "table-coffee", x: 2.25, z: 2.9, rotation: 0, locked: false },
    { id: "demo-chair", assetId: "chair-lounge", x: 3.6, z: 2.4, rotation: 330, locked: false },
    { id: "demo-shelf", assetId: "shelf-wide", x: 3.65, z: 0.28, rotation: 0, locked: false },
    { id: "demo-plant", assetId: "plant-large", x: 0.55, z: 4.55, rotation: 0, locked: false },
  ],
  walkwayClearance: 0.65,
  createdAt: "2026-07-21T08:00:00.000Z",
  updatedAt: "2026-08-11T08:00:00.000Z",
};
