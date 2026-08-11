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
  { icon: "🛋️", label: "ITEM 01", name: "โซฟา 2 ที่นั่ง Ari", width: "160 ซม.", depth: "82 ซม.", material: "ผ้าทอครีม", price: "฿15,900" },
  { icon: "☕", label: "ITEM 02", name: "โต๊ะกลาง Ploen", width: "105 ซม.", depth: "55 ซม.", material: "ไม้โอ๊ก", price: "฿5,200" },
  { icon: "🗄️", label: "ITEM 03", name: "ตู้เตี้ย Lanna", width: "140 ซม.", depth: "42 ซม.", material: "ไม้ปิดผิว", price: "฿6,500" },
  { icon: "💡", label: "ITEM 04", name: "โคมไฟตั้งพื้น Hue", width: "38 ซม.", depth: "38 ซม.", material: "อลูมิเนียม", price: "฿2,800" },
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
        <header className="showcase-intro">
          <div>
            <span>FURSIGN INTERIOR APPLICATION</span>
            <h1>ออกแบบพื้นที่อย่างมั่นใจ สเปกเป๊ะทุกตารางเมตร</h1>
          </div>
          <p>แบบจำลอง UI 6 ส่วน สะท้อนขั้นตอนตั้งแต่ AI พรอมต์ 3D Render ตารางสเปก และแคตตาล็อกเฟอร์นิเจอร์</p>
        </header>
        <section className="showcase-grid" aria-label="ภาพรวมเครื่องมือ Fursign หกส่วน">
          {/* Panel 1: Instant AI Room Designer */}
          <article className="showcase-panel prompt-designer-panel">
            <div className="panel-number">01</div>
            <p className="panel-kicker">INSTANT AI ROOM DESIGNER</p>
            <h2>ออกแบบห้องของคุณ<br />ด้วย AI พรอมต์</h2>
            <p className="panel-lead">เพียงพิมพ์โจทย์ของคุณลงไป</p>
            <div className="ai-prompt-row">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="ห้องนั่งเล่นขนาด 5x5 ม. สไตล์มินิมอล มีโซฟาและทีวี"
                aria-label="โจทย์ออกแบบห้อง"
              />
              <button onClick={openAiResult} type="button">ออกแบบเลย</button>
            </div>
            <div className="prompt-tags">
              {promptTags.map(([tag, value]) => (
                <button key={tag} onClick={() => setPrompt(value)} type="button">
                  {tag}
                </button>
              ))}
            </div>
          </article>

          {/* Panel 2: Room Preview Panel */}
          <article className="showcase-panel room-output-panel">
            <div className="panel-number">02</div>
            <p className="panel-kicker">ROOM PREVIEW PANEL</p>
            <Suspense fallback={<div className="mini-room-loading">กำลังสร้างห้อง 3D…</div>}>
              <MiniRoomPreview />
            </Suspense>
            <div className="room-output-copy">
              <b>ห้องนั่งเล่น 5m × 5m</b>
              <span>ผลลัพธ์จาก AI · ตรวจขนาดสเปกแล้ว</span>
            </div>
          </article>

          {/* Panel 3: Simplified Feature Overview */}
          <article className="showcase-panel feature-overview-panel">
            <div className="panel-number light">03</div>
            <p className="panel-kicker light">FURSIGN CORE</p>
            <h2>ฟีเจอร์เด่น:</h2>
            <p className="feature-headline">
              แปลงภาพเป็น 3D,<br />
              เช็คสเปกเป๊ะ,<br />
              และประวัติการออกแบบของคุณ
            </p>
            <ul>
              <li>
                <i>✨</i>
                <span>
                  <b>แปลงภาพเป็น 3D</b>
                  <small>เปลี่ยนภาพและแบบแปลนเป็นโมเดล 3D ทันที</small>
                </span>
              </li>
              <li>
                <i>📏</i>
                <span>
                  <b>เช็คสเปกเป๊ะ</b>
                  <small>ตรวจสอบขนาดและระยะห่างสเปกเฟอร์นิเจอร์แม่นยำ</small>
                </span>
              </li>
              <li>
                <i>🕒</i>
                <span>
                  <b>ประวัติการออกแบบของคุณ</b>
                  <small>ย้อนดูและบันทึกผลงานการออกแบบได้ตลอด</small>
                </span>
              </li>
            </ul>
            <button className="feature-link-btn" onClick={() => navigate("setup")} type="button">
              เริ่มออกแบบ ↗
            </button>
          </article>

          {/* Panel 4: Interactive 3D Editor (Floating Panels) */}
          <article className="showcase-panel editor-showcase-panel">
            <div className="panel-number">04</div>
            <p className="panel-kicker">INTERACTIVE 3D EDITOR</p>
            <div
              className="editor-showcase-canvas"
              onClick={openAiResult}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openAiResult()}
              aria-label="เปิดห้องตัวอย่างใน Editor"
            >
              <div className="editor-bg-grid" />
              <div className="floating-panel floating-library">
                <div className="floating-panel-header">
                  <span className="panel-badge-icon">📦</span>
                  <b>LIBRARY</b>
                </div>
                <div className="floating-items-row">
                  <span>โซฟา</span>
                  <span>โต๊ะ</span>
                  <span>ตู้</span>
                  <span>เก้าอี้</span>
                </div>
              </div>
              <div className="floating-panel floating-properties">
                <div className="floating-panel-header">
                  <span className="panel-badge-icon">⚙️</span>
                  <b>PROPERTIES</b>
                </div>
                <div className="floating-prop-stats">
                  <div><small>ขนาดห้อง</small><b>5.0 × 5.0 ม.</b></div>
                  <div><small>ระยะเดิน</small><b className="text-success">85 ซม. (ผ่าน)</b></div>
                </div>
              </div>
              <div className="editor-center-callout">
                <span className="editor-canvas-tag">3D CANVAS VIEW</span>
                <span className="editor-cta-pill">เปิด Editor ↗</span>
              </div>
            </div>
            <div className="panel-caption">
              <b>Interactive 3D Editor</b>
              <span>แผงควบคุมแบบลอยตัว ลาก วาง และเช็คระยะเดินจริง</span>
            </div>
          </article>

          {/* Panel 5: Spec Sheet Grid (Revised) */}
          <article className="showcase-panel spec-showcase-panel">
            <div className="panel-number">05</div>
            <p className="panel-kicker">SPEC SHEET GRID</p>
            <header>
              <div>
                <small>รายการเฟอร์นิเจอร์สเปกเป๊ะ</small>
                <h2>สเปกสินค้าในห้อง</h2>
              </div>
              <button type="button" onClick={() => navigate("spec")}>Export JSON</button>
            </header>
            <div className="spec-preview-table">
              {specRows.map((row) => (
                <article key={row.name}>
                  <span className="spec-thumb-icon">{row.icon}</span>
                  <div>
                    <small>{row.label}</small>
                    <b>{row.name}</b>
                  </div>
                  <dl>
                    <div>
                      <dt>กว้าง</dt>
                      <dd>{row.width}</dd>
                    </div>
                    <div>
                      <dt>ลึก</dt>
                      <dd>{row.depth}</dd>
                    </div>
                    <div>
                      <dt>วัสดุ</dt>
                      <dd>{row.material}</dd>
                    </div>
                    <div>
                      <dt>ราคา</dt>
                      <dd>{row.price}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </article>

          {/* Panel 6: Refined Furniture Catalog (Visual Fit) */}
          <article className="showcase-panel catalog-showcase-panel">
            <div className="panel-number">06</div>
            <p className="panel-kicker">REFINED FURNITURE CATALOG</p>
            <div className="catalog-preview-grid">
              {catalogPreview.map(({ asset, fit, label }) => (
                <article key={label}>
                  <header>
                    <b className="fit-badge">{fit}</b>
                    <button type="button" aria-label={`ถูกใจ ${label}`} className="like-btn">♡</button>
                  </header>
                  <div className="catalog-preview-object" style={{ "--preview-color": asset.color } as React.CSSProperties}>
                    <i className="object-icon">{asset.thumbnail}</i>
                  </div>
                  <h3>{label}</h3>
                  <p>{Math.round(asset.width * 100)} × {Math.round(asset.depth * 100)} ซม.</p>
                </article>
              ))}
            </div>
            <button className="catalog-cta" type="button" onClick={() => openProject("demo-living-room")}>
              ดูสินค้าที่ใส่ได้ทั้งหมด →
            </button>
          </article>
        </section>
      </main>
      <footer className="site-footer showcase-footer">
        <button className="footer-brand" onClick={() => navigate("landing")} type="button">
          <span>F</span> Fursign
        </button>
        <p>Space, measured. · © 2026 Fursign</p>
      </footer>
    </div>
  );
}

