"use client";

import { useState, type FormEvent } from "react";
import { Brand } from "@/components/layout/Brand";
import { demoProject } from "@/data/catalog";
import { createId } from "@/lib/engine.mjs";
import { useFursign } from "@/features/projects/FursignContext";
import type { Door, Project, WindowOpening } from "@/types/fursign";

const ROOM_JSON_EXAMPLE = JSON.stringify({ schemaVersion: 1, unit: "meter", room: { width: 4, length: 5, height: 2.6, doors: [], windows: [] }, placements: [] });
type WallSide = Door["wall"];

export function SetupView() {
  const { navigate, setProject, notify } = useFursign();
  const [unit, setUnit] = useState<"meter" | "centimeter">("meter");
  const [importText, setImportText] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "ห้องใหม่ของฉัน", roomType: "ห้องนั่งเล่น", width: 4, length: 5, height: 2.6,
    doorWall: "north" as WallSide, doorOffset: .75, doorWidth: .9, doorHeight: 2, doorSwing: "right" as Door["swing"],
    windowEnabled: true, windowWall: "west" as WallSide, windowOffset: 2.5, windowWidth: 1.4, windowHeight: 1.2, sillHeight: .8,
    budget: 30000, style: "Minimal", color: "Beige",
  });

  const updateNumber = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: Number(value) }));
  const unitLabel = unit === "meter" ? "ม." : "ซม.";
  const step = unit === "meter" ? .05 : 5;

  const changeUnit = (nextUnit: typeof unit) => {
    if (nextUnit === unit) return;
    const multiply = nextUnit === "centimeter" ? 100 : .01;
    setForm((current) => ({
      ...current,
      width: current.width * multiply, length: current.length * multiply, height: current.height * multiply,
      doorOffset: current.doorOffset * multiply, doorWidth: current.doorWidth * multiply, doorHeight: current.doorHeight * multiply,
      windowOffset: current.windowOffset * multiply, windowWidth: current.windowWidth * multiply, windowHeight: current.windowHeight * multiply, sillHeight: current.sillHeight * multiply,
    }));
    setUnit(nextUnit);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const factor = unit === "centimeter" ? .01 : 1;
    const width = form.width * factor;
    const length = form.length * factor;
    const height = form.height * factor;
    const doorWidth = form.doorWidth * factor;
    const doorSpan = form.doorWall === "north" || form.doorWall === "south" ? width : length;
    const doorOffset = Math.min(doorSpan - doorWidth / 2, Math.max(doorWidth / 2, form.doorOffset * factor));
    if (width < 1.5 || width > 20 || length < 1.5 || length > 20 || height < 2 || height > 6 || doorWidth < .6 || doorWidth >= doorSpan) {
      setError("กรุณาตรวจขนาดห้องและประตู: ห้องกว้าง/ยาว 1.5–20 ม. สูง 2–6 ม. และประตูต้องอยู่ภายในผนัง");
      return;
    }
    const door: Door = { id: createId("door"), wall: form.doorWall, offset: doorOffset, width: doorWidth, height: form.doorHeight * factor, swing: form.doorSwing };
    const windows: WindowOpening[] = [];
    if (form.windowEnabled) {
      const windowWidth = form.windowWidth * factor;
      const windowSpan = form.windowWall === "north" || form.windowWall === "south" ? width : length;
      if (windowWidth <= 0 || windowWidth >= windowSpan) { setError("หน้าต่างต้องมีความกว้างน้อยกว่าผนังที่เลือก"); return; }
      windows.push({ id: createId("window"), wall: form.windowWall, offset: Math.min(windowSpan - windowWidth / 2, Math.max(windowWidth / 2, form.windowOffset * factor)), width: windowWidth, height: form.windowHeight * factor, sillHeight: form.sillHeight * factor });
    }
    const now = new Date().toISOString();
    const next: Project = {
      ...demoProject,
      id: createId("project"), name: form.name.trim() || "ห้องใหม่", roomType: form.roomType,
      budget: form.budget, style: form.style, colorPreference: form.color,
      room: { width, length, height, doors: [door], windows }, placements: [], createdAt: now, updatedAt: now,
    };
    setProject(next);
    navigate("editor");
  };

  const importProject = () => {
    try {
      const parsed = JSON.parse(importText) as Partial<Project>;
      if (parsed.schemaVersion !== 1 || parsed.unit !== "meter" || !parsed.room || !Array.isArray(parsed.room.doors) || !Array.isArray(parsed.room.windows) || !Array.isArray(parsed.placements)) throw new Error();
      const next = { ...demoProject, ...parsed, id: createId("import"), name: parsed.name || "ห้องจากไฟล์สแกน", updatedAt: new Date().toISOString() } as Project;
      setProject(next); notify("ตรวจสอบ JSON แล้ว พร้อมเข้า Editor"); navigate("editor");
    } catch { setError("JSON ไม่ตรงกับ Fursign schemaVersion 1 หรือมีข้อมูลห้องไม่ครบ"); }
  };

  return (
    <div className="setup-page">
      <header className="workspace-header"><Brand /><button onClick={() => navigate("projects")}>← กลับโปรเจกต์</button></header>
      <div className="setup-layout">
        <section className="setup-aside"><p className="eyebrow light"><span /> ขั้นตอนที่ 1 จาก 2</p><h1>เริ่มจาก<br />พื้นที่จริง</h1><p>ข้อมูลนี้ใช้สร้างสัดส่วนห้อง ตรวจการชน และคำนวณสเปกสินค้า</p><div className="setup-illustration"><span>W {form.width} {unitLabel}</span><b>{form.roomType}</b><i>ประตู {form.doorWidth} {unitLabel}</i></div></section>
        <form className="setup-form" onSubmit={submit}>
          <div className="form-heading"><span>ROOM SETUP</span><h2>รายละเอียดห้อง</h2><p>กรอกขนาดจากผนังด้านในเพื่อความแม่นยำ</p></div>
          {error && <div className="form-error" role="alert">! {error}</div>}
          <div className="form-grid">
            <label className="full">ชื่อโปรเจกต์<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>ประเภทห้อง<select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}><option>ห้องนั่งเล่น</option><option>ห้องนอน</option><option>ห้องทำงาน</option><option>ห้องอาหาร</option></select></label>
            <label>หน่วย<select value={unit} onChange={(e) => changeUnit(e.target.value as typeof unit)}><option value="meter">เมตร</option><option value="centimeter">เซนติเมตร</option></select></label>
            <label>ความกว้าง ({unitLabel})<input type="number" min="1" step={step} value={form.width} onChange={(e) => updateNumber("width", e.target.value)} /></label>
            <label>ความยาว ({unitLabel})<input type="number" min="1" step={step} value={form.length} onChange={(e) => updateNumber("length", e.target.value)} /></label>
            <label>ความสูง ({unitLabel})<input type="number" min="1" step={step} value={form.height} onChange={(e) => updateNumber("height", e.target.value)} /></label>
            <div className="form-section-label full"><span>DOOR</span><b>ตำแหน่งและทิศทางเปิดประตู</b></div>
            <label>ผนัง<select value={form.doorWall} onChange={(e) => setForm({ ...form, doorWall: e.target.value as WallSide })}><option value="north">เหนือ</option><option value="east">ตะวันออก</option><option value="south">ใต้</option><option value="west">ตะวันตก</option></select></label>
            <label>ระยะจากมุม ({unitLabel})<input type="number" min="0" step={step} value={form.doorOffset} onChange={(e) => updateNumber("doorOffset", e.target.value)} /></label>
            <label>ความกว้าง ({unitLabel})<input type="number" min=".1" step={step} value={form.doorWidth} onChange={(e) => updateNumber("doorWidth", e.target.value)} /></label>
            <label>ความสูง ({unitLabel})<input type="number" min=".1" step={step} value={form.doorHeight} onChange={(e) => updateNumber("doorHeight", e.target.value)} /></label>
            <label className="full">ทิศทางเปิด<select value={form.doorSwing} onChange={(e) => setForm({ ...form, doorSwing: e.target.value as Door["swing"] })}><option value="right">เปิดขวา</option><option value="left">เปิดซ้าย</option></select></label>
            <div className="form-section-label full"><span>WINDOW</span><b>ตำแหน่งและขนาดหน้าต่าง</b><label className="inline-check"><input type="checkbox" checked={form.windowEnabled} onChange={(e) => setForm({ ...form, windowEnabled: e.target.checked })} /> มีหน้าต่าง</label></div>
            {form.windowEnabled && <>
              <label>ผนัง<select value={form.windowWall} onChange={(e) => setForm({ ...form, windowWall: e.target.value as WallSide })}><option value="north">เหนือ</option><option value="east">ตะวันออก</option><option value="south">ใต้</option><option value="west">ตะวันตก</option></select></label>
              <label>ระยะจากมุม ({unitLabel})<input type="number" min="0" step={step} value={form.windowOffset} onChange={(e) => updateNumber("windowOffset", e.target.value)} /></label>
              <label>ความกว้าง ({unitLabel})<input type="number" min=".1" step={step} value={form.windowWidth} onChange={(e) => updateNumber("windowWidth", e.target.value)} /></label>
              <label>ความสูง ({unitLabel})<input type="number" min=".1" step={step} value={form.windowHeight} onChange={(e) => updateNumber("windowHeight", e.target.value)} /></label>
              <label className="full">ขอบล่างจากพื้น ({unitLabel})<input type="number" min="0" step={step} value={form.sillHeight} onChange={(e) => updateNumber("sillHeight", e.target.value)} /></label>
            </>}
            <div className="form-section-label full"><span>PREFERENCES</span><b>งบและสไตล์</b></div>
            <label>งบประมาณ (บาท)<input type="number" min="0" step="1000" value={form.budget} onChange={(e) => updateNumber("budget", e.target.value)} /></label>
            <label>สไตล์<select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}><option>Minimal</option><option>Japandi</option><option>Modern</option><option>Natural</option></select></label>
            <label className="full">โทนสี<select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}><option>Beige</option><option>Oak</option><option>Sage</option><option>Terracotta</option></select></label>
          </div>
          <details className="import-panel"><summary>นำเข้าข้อมูล Room JSON <span>สำหรับ AR Scan ในอนาคต</span></summary><textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={ROOM_JSON_EXAMPLE} /><button type="button" className="button button-outline" onClick={importProject}>ตรวจสอบและนำเข้า</button></details>
          <button className="button button-primary button-large form-submit">สร้างห้อง 3D <span>→</span></button>
        </form>
      </div>
    </div>
  );
}
