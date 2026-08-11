"use client";

import { useMemo, useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { furnitureAssets } from "@/data/catalog";
import { generateRequirement, metersToCentimeters } from "@/lib/engine.mjs";
import { useFursign } from "@/features/projects/FursignContext";

export function SpecificationView() {
  const { project, warnings, navigate, saveProject, notify } = useFursign();
  const requirements = useMemo(() => project.placements.map((placement) => {
    const asset = furnitureAssets.find((item) => item.id === placement.assetId)!;
    return generateRequirement(project, placement, asset);
  }), [project]);
  const [wanted, setWanted] = useState<string[]>(requirements.map((item) => item.placementId));
  const remaining = Math.max(0, project.budget - project.placements.reduce((sum, _item, index) => sum + 1800 + index * 460, 0));

  const exportJson = () => {
    const payload = { ...project, productRequirements: requirements.filter((item) => wanted.includes(item.placementId)) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, "-")}.fursign.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("ส่งออก Room JSON แล้ว");
  };

  const goRecommendations = () => {
    window.localStorage.setItem("fursign.wanted.v1", JSON.stringify(wanted));
    saveProject("บันทึกสเปกแล้ว");
    navigate("recommendations");
  };

  return (
    <div className="workspace-page spec-page">
      <header className="workspace-header"><Brand /><div><button onClick={() => navigate("editor")}>← กลับไปแก้ห้อง</button><button className="button button-outline" onClick={exportJson}>⇩ Export JSON</button><button className="button button-dark" onClick={() => window.print()}>พิมพ์สเปก</button></div></header>
      <div className="spec-hero"><div><p className="eyebrow"><span /> คำนวณจากตำแหน่งจริง</p><h1>สเปกที่พอดีกับ<br />“{project.name}”</h1><p>ขนาดสูงสุดคำนวณจากพื้นที่ว่างรอบวัตถุ Generic ที่คุณวางไว้</p></div><div className="spec-summary"><span><small>ขนาดห้อง</small><b>{project.room.width} × {project.room.length} ม.</b></span><span><small>งบคงเหลือโดยประมาณ</small><b>฿{remaining.toLocaleString("th-TH")}</b></span><span className={warnings.length ? "has-warning" : ""}><small>คำเตือนที่ยังไม่แก้</small><b>{warnings.length} รายการ</b></span></div></div>
      <div className="spec-layout">
        <section className="requirement-list">
          <div className="list-heading"><div><span>PRODUCT REQUIREMENTS</span><h2>เลือกหมวดที่ต้องการซื้อจริง</h2></div><small>{wanted.length} จาก {requirements.length} รายการ</small></div>
          {requirements.length ? requirements.map((requirement, index) => {
            const placement = project.placements.find((item) => item.id === requirement.placementId)!;
            const asset = furnitureAssets.find((item) => item.id === placement.assetId)!;
            const checked = wanted.includes(requirement.placementId);
            return <article className={`requirement-card ${checked ? "selected" : ""}`} key={requirement.placementId}>
              <label><input type="checkbox" checked={checked} onChange={() => setWanted((current) => checked ? current.filter((id) => id !== requirement.placementId) : [...current, requirement.placementId])} /><span style={{ background: asset.color }}>{asset.thumbnail}</span></label>
              <div className="requirement-main"><div><small>รายการ {String(index + 1).padStart(2, "0")} · {asset.category.toUpperCase()}</small><h3>{requirement.label}</h3></div><div className="spec-measures"><span><small>กว้างสูงสุด</small><b>{metersToCentimeters(requirement.maxWidth)} ซม.</b></span><span><small>ลึกสูงสุด</small><b>{metersToCentimeters(requirement.maxDepth)} ซม.</b></span><span><small>สูงแนะนำ</small><b>≤ {metersToCentimeters(requirement.maxHeight)} ซม.</b></span><span><small>งบต่อชิ้น</small><b>฿{requirement.budget.toLocaleString("th-TH")}</b></span></div><p><b>{requirement.style}</b><span>{requirement.color}</span> · คำนวณจากพื้นที่ว่างรอบตำแหน่ง ({placement.x}, {placement.z})</p></div>
            </article>;
          }) : <div className="spec-empty"><span>□</span><h3>ยังไม่มีเฟอร์นิเจอร์ในห้อง</h3><p>กลับไป Editor แล้ววางเฟอร์นิเจอร์ Generic เพื่อคำนวณสเปก</p><button className="button button-primary" onClick={() => navigate("editor")}>กลับไปเพิ่มเฟอร์นิเจอร์</button></div>}
        </section>
        <aside className="spec-sidebar"><div className="method-card"><span>HOW IT WORKS</span><h3>ตัวเลขนี้มาจากไหน?</h3><ol><li><b>01</b>อ่านขนาดห้องจริง</li><li><b>02</b>คำนวณระยะถึงผนังและวัตถุ</li><li><b>03</b>หักพื้นที่เผื่อรอบตำแหน่ง</li><li><b>04</b>กรองสินค้าด้วยขนาดสูงสุด</li></ol><p>ระบบ Geometry เป็นผู้ตัดสิน Fit ไม่ใช่ AI</p></div>
          <div className="warning-card"><header><b>สถานะห้อง</b><span className={warnings.length ? "warn" : "ok"}>{warnings.length ? `${warnings.length} เตือน` : "พร้อม"}</span></header>{warnings.length ? [...new Set(warnings.map((item) => item.message))].map((message) => <p key={message}>⚠ {message}</p>) : <p>✓ ไม่พบการชนหรือกีดขวางประตู</p>}<button onClick={() => navigate("editor")}>ตรวจใน Editor →</button></div>
          <button className="button button-primary button-large recommend-cta" disabled={!wanted.length} onClick={goRecommendations}>ดูสินค้าที่ใส่ได้ <span>→</span></button>
        </aside>
      </div>
    </div>
  );
}
