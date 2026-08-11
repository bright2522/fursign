"use client";

import { useState, type FormEvent } from "react";
import { Brand } from "@/components/layout/Brand";
import { demoProject } from "@/data/catalog";
import { createId } from "@/lib/engine.mjs";
import { useFursign } from "@/features/projects/FursignContext";
import type { Project } from "@/types/fursign";

const ROOM_JSON_EXAMPLE = JSON.stringify({ schemaVersion: 1, unit: "meter", room: { width: 4, length: 5, height: 2.6, doors: [], windows: [] }, placements: [] });

export function SetupView() {
  const { navigate, setProject, notify } = useFursign();
  const [unit, setUnit] = useState<"meter" | "centimeter">("meter");
  const [importText, setImportText] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "ห้องใหม่ของฉัน", roomType: "ห้องนั่งเล่น", width: 4, length: 5, height: 2.6, doorWidth: 0.9, budget: 30000, style: "Minimal", color: "Beige" });

  const updateNumber = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: Number(value) }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const factor = unit === "centimeter" ? 0.01 : 1;
    const width = form.width * factor;
    const length = form.length * factor;
    const height = form.height * factor;
    if (width < 1.5 || width > 20 || length < 1.5 || length > 20 || height < 2 || height > 6) {
      setError("กรุณาตรวจขนาดห้อง: กว้าง/ยาว 1.5–20 ม. และสูง 2–6 ม.");
      return;
    }
    const now = new Date().toISOString();
    const next: Project = {
      ...demoProject,
      id: createId("project"),
      name: form.name.trim() || "ห้องใหม่",
      roomType: form.roomType,
      budget: form.budget,
      style: form.style,
      colorPreference: form.color,
      room: { width, length, height, doors: [{ id: createId("door"), wall: "north", offset: Math.min(width - form.doorWidth / 2, Math.max(form.doorWidth / 2, width * 0.18)), width: form.doorWidth, height: 2, swing: "right" }], windows: [] },
      placements: [],
      createdAt: now,
      updatedAt: now,
    };
    setProject(next);
    navigate("editor");
  };

  const importProject = () => {
    try {
      const parsed = JSON.parse(importText) as Partial<Project>;
      if (parsed.schemaVersion !== 1 || !parsed.room || !Array.isArray(parsed.placements)) throw new Error();
      const next = { ...demoProject, ...parsed, id: createId("import"), name: parsed.name || "ห้องจากไฟล์สแกน", updatedAt: new Date().toISOString() } as Project;
      setProject(next);
      notify("ตรวจสอบ JSON แล้ว พร้อมเข้า Editor");
      navigate("editor");
    } catch { setError("JSON ไม่ตรงกับ Fursign schemaVersion 1 กรุณาตรวจข้อมูลอีกครั้ง"); }
  };

  return (
    <div className="setup-page">
      <header className="workspace-header"><Brand /><button onClick={() => navigate("projects")}>← กลับโปรเจกต์</button></header>
      <div className="setup-layout">
        <section className="setup-aside"><p className="eyebrow light"><span /> ขั้นตอนที่ 1 จาก 2</p><h1>เริ่มจาก<br />พื้นที่จริง</h1><p>ข้อมูลนี้ใช้สร้างสัดส่วนห้อง ตรวจการชน และคำนวณสเปกสินค้า</p><div className="setup-illustration"><span>W {form.width}{unit === "meter" ? " ม." : " ซม."}</span><b>{form.roomType}</b><i>ประตู {form.doorWidth} ม.</i></div></section>
        <form className="setup-form" onSubmit={submit}>
          <div className="form-heading"><span>ROOM SETUP</span><h2>รายละเอียดห้อง</h2><p>กรอกขนาดจากผนังด้านในเพื่อความแม่นยำ</p></div>
          {error && <div className="form-error" role="alert">! {error}</div>}
          <div className="form-grid">
            <label className="full">ชื่อโปรเจกต์<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>ประเภทห้อง<select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}><option>ห้องนั่งเล่น</option><option>ห้องนอน</option><option>ห้องทำงาน</option><option>ห้องอาหาร</option></select></label>
            <label>หน่วย<select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}><option value="meter">เมตร</option><option value="centimeter">เซนติเมตร</option></select></label>
            <label>ความกว้าง<input type="number" min="1" step="0.1" value={form.width} onChange={(e) => updateNumber("width", e.target.value)} /></label>
            <label>ความยาว<input type="number" min="1" step="0.1" value={form.length} onChange={(e) => updateNumber("length", e.target.value)} /></label>
            <label>ความสูง<input type="number" min="2" step="0.1" value={form.height} onChange={(e) => updateNumber("height", e.target.value)} /></label>
            <label>ความกว้างประตู<input type="number" min="0.6" max="2" step="0.05" value={form.doorWidth} onChange={(e) => updateNumber("doorWidth", e.target.value)} /></label>
            <label>งบประมาณ (บาท)<input type="number" min="0" step="1000" value={form.budget} onChange={(e) => updateNumber("budget", e.target.value)} /></label>
            <label>สไตล์<select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}><option>Minimal</option><option>Japandi</option><option>Modern</option><option>Natural</option></select></label>
            <label>โทนสี<select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}><option>Beige</option><option>Oak</option><option>Sage</option><option>Terracotta</option></select></label>
          </div>
          <details className="import-panel"><summary>นำเข้าข้อมูล Room JSON <span>สำหรับ AR Scan ในอนาคต</span></summary><textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={ROOM_JSON_EXAMPLE} /><button type="button" className="button button-outline" onClick={importProject}>ตรวจสอบและนำเข้า</button></details>
          <button className="button button-primary button-large form-submit">สร้างห้อง 3D <span>→</span></button>
        </form>
      </div>
    </div>
  );
}
