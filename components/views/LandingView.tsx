"use client";

import { lazy, Suspense, useState } from "react";
import { PublicNav } from "@/components/layout/Brand";
import { furnitureAssets } from "@/data/catalog";
import { useFursign } from "@/features/projects/FursignContext";

const MiniRoomPreview = lazy(() => import("@/components/marketing/MiniRoomPreview"));

const promptTags = [
  ["#มินิมอล", "ห้องนั่งเล่นขนาด 5x5 ม. สไตล์มินิมอล มีโซฟาและทีวี"],
  ["#วินเทจ", "ห้องนั่งเล่นขนาด 5x5 ม. สไตล์วินเทจ โทนไม้เข้ม"],
  ["#ห้องนอน", "ห้องนอนขนาด 4x5 ม. มีเตียงควีน โต๊ะข้าง และตู้เสื้อผ้า"],
  ["#คอนโด", "ห้องคอนโดขนาดกะทัดรัด มีโซฟา โต๊ะทำงาน และพื้นที่เดิน 80 ซม."],
];

const specRows = [
  { icon: "โต๊ะ", name: "โต๊ะ 2 ที่นั่ง", width: "120 ซม.", depth: "60 ซม.", material: "ไม้โอ๊ก", price: "฿8,900" },
  { icon: "โซฟา", name: "โซฟา 2 ที่นั่ง", width: "160 ซม.", depth: "82 ซม.", material: "ผ้าทอ", price: "฿15,900" },
  { icon: "ตู้", name: "ตู้เตี้ย", width: "140 ซม.", depth: "42 ซม.", material: "ไม้ปิดผิว", price: "฿6,500" },
];

const catalogPreview = [
  ["bed-platform", "95% FIT", "เตียงแพลตฟอร์ม Ploen"],
  ["bed-single", "80% FIT", "เตียงเดี่ยว Hue"],
  ["sofa-2", "92% FIT", "โซฟา 2 ที่นั่ง Ari"],
  ["cabinet-low", "86% FIT", "ตู้เตี้ย Lanna"],
].map(([assetId, fit, label]) => ({ asset: furnitureAssets.find((item) => item.id === assetId)!, fit, label }));

export function LandingView() {
  const { navigate, openProject } = useFursign();
  const [prompt, setPrompt] = useState("ห้องนั่งเล่นขนาด 5x5 ม. สไตล์มินิมอล มีโซฟาและทีวี");
  const openAiResult = () => openProject("demo-living-room");

  return (
    <div className="landing-page showcase-landing">
      <PublicNav />
      <main className="showcase-shell">
        <header className="showcase-intro"><div><span>AI SPACE PLANNER</span><h1>วางภาพรวมให้ชัด ก่อนลงรายละเอียดจริง</h1></div><p>จากพรอมต์สั้น ๆ สู่ห้อง 3D สเปก และตัวเลือกสินค้าที่ตรวจขนาดแล้ว</p></header>
        <section className="showcase-grid" aria-label="ภาพรวมเครื่องมือ Fursign หกส่วน">
          <article className="showcase-panel prompt-designer-panel">
            <div className="panel-number">01</div>
            <p className="panel-kicker">INSTANT AI ROOM DESIGNER</p>
            <h2>ออกแบบห้องของคุณ<br />ด้วย AI พรอมต์</h2>
            <p className="panel-lead">เพียงพิมพ์โจทย์ของคุณลงไป</p>
            <div className="ai-prompt-row"><span>⌕</span><input value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="โจทย์ออกแบบห้อง" /><button onClick={openAiResult}>ออกแบบเลย</button></div>
            <div className="prompt-tags">{promptTags.map(([tag, value]) => <button key={tag} onClick={() => setPrompt(value)}>{tag}</button>)}</div>
            <small>ระบบจะเริ่มจากขนาดจริง และให้คุณปรับต่อใน Editor</small>
          </article>

          <article className="showcase-panel room-output-panel">
            <div className="panel-number">02</div>
            <p className="panel-kicker">ROOM PREVIEW PANEL</p>
            <Suspense fallback={<div className="mini-room-loading">กำลังสร้างห้อง 3D…</div>}><MiniRoomPreview /></Suspense>
            <div className="room-output-copy"><b>ห้องนั่งเล่น 5 × 5 ม.</b><span>โมเดลจริง · ตรวจพื้นที่เดินแล้ว</span></div>
          </article>

          <article className="showcase-panel feature-overview-panel">
            <div className="panel-number">03</div>
            <p className="panel-kicker light">FURSIGN CORE</p>
            <h2>ฟีเจอร์เด่น:</h2>
            <p>แปลงโจทย์เป็น 3D,<br />เช็คสเปกเป๊ะ<br />และประวัติการออกแบบของคุณ</p>
            <ul><li><i>◇</i><span><b>แปลงพื้นที่เป็น 3D</b><small>จัดห้องด้วยโมเดลและขนาดจริง</small></span></li><li><i>⌁</i><span><b>เช็ค Fit ก่อนซื้อ</b><small>เตือนการชนและโซนเปิดประตู</small></span></li><li><i>↶</i><span><b>กลับมาแก้ไขได้</b><small>บันทึกประวัติไว้ในอุปกรณ์นี้</small></span></li></ul>
            <button onClick={() => navigate("setup")}>เริ่มวัดห้อง <span>↗</span></button>
          </article>

          <article className="showcase-panel editor-showcase-panel">
            <div className="panel-number">04</div>
            <p className="panel-kicker">INTERACTIVE 3D EDITOR</p>
            <button className="editor-showcase-image" onClick={openAiResult} aria-label="เปิดห้องตัวอย่างใน Editor"><span className="floating-library">LIBRARY<br /><b>＋ เพิ่มของ</b></span><span className="floating-properties">PROPERTIES<br /><b>Grid · ผนัง</b></span><i>เปิด Editor ↗</i></button>
            <div className="panel-caption"><b>Interactive 3D Editor</b><span>ลาก วาง หมุน และตรวจโซนอันตรายแบบทันที</span></div>
          </article>

          <article className="showcase-panel spec-showcase-panel">
            <div className="panel-number">05</div>
            <p className="panel-kicker">SPEC SHEET GRID</p>
            <header><div><small>สเปกที่พอดีกับห้อง</small><h2>สเปกที่พอดี</h2></div><button onClick={() => navigate("spec")}>Export JSON</button></header>
            <div className="spec-preview-table">{specRows.map((row, index) => <article key={row.name}><span>{row.icon}</span><div><small>ITEM 0{index + 1}</small><b>{row.name}</b></div><dl><div><dt>กว้าง</dt><dd>{row.width}</dd></div><div><dt>ลึก</dt><dd>{row.depth}</dd></div><div><dt>วัสดุ</dt><dd>{row.material}</dd></div><div><dt>ราคา</dt><dd>{row.price}</dd></div></dl></article>)}</div>
          </article>

          <article className="showcase-panel catalog-showcase-panel">
            <div className="panel-number">06</div>
            <p className="panel-kicker">REFINED FURNITURE CATALOG</p>
            <div className="catalog-preview-grid">{catalogPreview.map(({ asset, fit, label }) => <article key={label}><header><b>{fit}</b><button aria-label={`ถูกใจ ${label}`}>♡</button></header><div className="catalog-preview-object" style={{ "--preview-color": asset.color } as React.CSSProperties}><i>{asset.thumbnail}</i></div><h3>{label}</h3><p>{Math.round(asset.width * 100)} × {Math.round(asset.depth * 100)} ซม.</p></article>)}</div>
            <button className="catalog-cta" onClick={() => openProject("demo-living-room")}>ดูสินค้าที่ใส่ได้ทั้งหมด →</button>
          </article>
        </section>
      </main>
      <footer className="site-footer showcase-footer"><button className="footer-brand" onClick={() => navigate("landing")}><span>F</span> Fursign</button><p>Space, measured. · © 2026 Fursign</p></footer>
    </div>
  );
}
