"use client";

import { useMemo, useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { furnitureAssets, products } from "@/data/catalog";
import { createId, generateRequirement, recommendProducts } from "@/lib/engine.mjs";
import { useFursign } from "@/features/projects/FursignContext";
import type { AffiliateClick, Recommendation } from "@/types/fursign";

export function RecommendationsView() {
  const { project, navigate, notify } = useFursign();
  const requirements = useMemo(() => project.placements.map((placement) => generateRequirement(project, placement, furnitureAssets.find((item) => item.id === placement.assetId)!)), [project]);
  const [activeId, setActiveId] = useState(requirements[0]?.placementId ?? "");
  const [budgetConstraint, setBudgetConstraint] = useState(true);
  const [sort, setSort] = useState<"fit" | "price">("fit");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const active = requirements.find((item) => item.placementId === activeId) ?? requirements[0];
  const results = useMemo(() => active ? recommendProducts(active, products, budgetConstraint) : [], [active, budgetConstraint]);
  const sorted = sort === "price" ? [...results].sort((a, b) => a.product.price - b.product.price) : results;

  const outbound = (productId: string) => {
    const product = products.find((item) => item.id === productId)!;
    const click: AffiliateClick = { clickId: createId("click"), projectId: project.id, productId, merchantId: product.merchantId, timestamp: new Date().toISOString(), sourceSpec: active ? `${active.category}:${active.maxWidth}x${active.maxDepth}` : "unknown" };
    const stored = JSON.parse(window.localStorage.getItem("fursign.clicks.v1") || "[]") as AffiliateClick[];
    window.localStorage.setItem("fursign.clicks.v1", JSON.stringify([...stored, click]));
    notify("บันทึก Outbound Click แล้ว");
    window.open(product.productUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="workspace-page recommendations-page">
      <header className="workspace-header"><Brand /><div><button onClick={() => navigate("spec")}>← กลับสเปก</button><button onClick={() => navigate("projects")}>โปรเจกต์ของฉัน</button></div></header>
      <section className="recommend-header"><div><p className="eyebrow"><span /> ผ่านเงื่อนไขขนาดจริงแล้ว</p><h1>สินค้าที่ใส่ได้</h1><p>สินค้าทุกชิ้นด้านล่างผ่าน Hard Filter ด้านหมวด ขนาด และสต็อกก่อนจัดอันดับ</p></div>{active && <div className="active-spec"><small>กำลังเลือกให้</small><b>{active.label}</b><span>≤ {Math.round(active.maxWidth * 100)} × {Math.round(active.maxDepth * 100)} ซม.</span></div>}</section>
      <div className="recommend-controls"><div className="requirement-tabs">{requirements.map((item) => <button className={item.placementId === active?.placementId ? "active" : ""} key={item.placementId} onClick={() => setActiveId(item.placementId)}>{item.label}</button>)}</div><div><label className="budget-toggle"><input type="checkbox" checked={budgetConstraint} onChange={(event) => setBudgetConstraint(event.target.checked)} /> ไม่เกินงบ</label><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="fit">เรียงตาม Fit Score</option><option value="price">ราคาต่ำสุด</option></select></div></div>
      {sorted.length ? <section className="product-grid">{sorted.map(({ product, fitScore, reasons }: Recommendation, index: number) => <article className="product-card" key={product.id}>
        <div className="product-image"><span>{product.image}</span>{product.sponsored && <b className="sponsored">สนับสนุน</b>}<button className={favorites.includes(product.id) ? "favorite active" : "favorite"} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>♡</button><i>{String(index + 1).padStart(2, "0")}</i></div>
        <div className="product-content"><div className="fit-row"><b>{fitScore}% FIT</b><span>มีสินค้า</span></div><h2>{product.name}</h2><p className="merchant-name">ร้านตัวอย่าง {product.merchantId.slice(-1)}</p><div className="product-dimensions">{Math.round(product.width * 100)} × {Math.round(product.depth * 100)} × {Math.round(product.height * 100)} ซม.</div><ul>{reasons.slice(0, 2).map((reason: string) => <li key={reason}>✓ {reason}</li>)}</ul><div className="product-footer"><b>฿{product.price.toLocaleString("th-TH")}</b><button onClick={() => outbound(product.id)}>ไปหน้าร้าน ↗</button></div><label className="compare-check"><input type="checkbox" checked={compare.includes(product.id)} disabled={!compare.includes(product.id) && compare.length >= 3} onChange={() => setCompare((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} /> เปรียบเทียบ</label></div>
      </article>)}</section> : <div className="recommend-empty"><span>⌕</span><h2>ยังไม่พบสินค้าที่พอดี</h2><p>ลองปิดเงื่อนไขงบประมาณ หรือกลับไปปรับพื้นที่ในห้อง</p><button className="button button-primary" onClick={() => setBudgetConstraint(false)}>แสดงสินค้านอกงบ</button></div>}
      {compare.length > 0 && <div className="compare-dock"><span>เลือกเปรียบเทียบ <b>{compare.length}/3</b></span>{compare.map((id) => <i key={id}>{products.find((item) => item.id === id)?.image}</i>)}<button onClick={() => notify("Prototype เตรียมข้อมูลเปรียบเทียบแล้ว")}>เปรียบเทียบสินค้า →</button></div>}
      <p className="affiliate-note">การกดออกไปหน้าร้านเป็นเพียง Outbound Click ไม่ใช่หลักฐานว่าซื้อสำเร็จ · ข้อมูลสินค้าเป็น Mock Dataset สำหรับทดสอบ</p>
    </div>
  );
}
