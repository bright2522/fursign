"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Brand } from "@/components/layout/Brand";
import { furnitureAssets } from "@/data/catalog";
import { createId, normalizeRotation } from "@/lib/engine.mjs";
import { useFursign } from "@/features/projects/FursignContext";
import type { FurnitureAsset, FurniturePlacement } from "@/types/fursign";
import { AssistantPanel } from "./AssistantPanel";
import { RoomCanvas, type CameraState } from "./RoomCanvas";

const categories: Array<[string, string]> = [["all", "ทั้งหมด"], ["sofa", "โซฟา"], ["table", "โต๊ะ"], ["chair", "เก้าอี้"], ["bed", "เตียง"], ["storage", "ตู้"], ["decor", "ตกแต่ง"]];

export function EditorView() {
  const { project, selectedId, select, warnings, updatePlacements, saveProject, navigate, undo, redo, historyCount, futureCount, setProject, setAssistantOpen } = useFursign();
  const [camera, setCamera] = useState<CameraState>({ yaw: -8, pitch: 55, zoom: 0.92, panX: 0, panY: 10, mode: "orbit" });
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [snapRotation, setSnapRotation] = useState(true);
  const [snapWall, setSnapWall] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"library" | "properties" | null>(null);
  const selected = project.placements.find((item) => item.id === selectedId) ?? null;
  const selectedAsset = selected ? furnitureAssets.find((item) => item.id === selected.assetId) ?? null : null;
  const visibleAssets = useMemo(() => furnitureAssets.filter((item) => (category === "all" || item.category === category) && item.name.includes(search)), [category, search]);

  const replacePlacement = (id: string, patch: Partial<FurniturePlacement>) => {
    updatePlacements(project.placements.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const addAsset = (asset: FurnitureAsset) => {
    const offset = (project.placements.length % 4) * 0.18;
    const placement: FurniturePlacement = { id: createId("placement"), assetId: asset.id, x: Number((project.room.width / 2 + offset).toFixed(2)), z: Number((project.room.length / 2 + offset).toFixed(2)), rotation: 0, locked: false };
    updatePlacements([...project.placements, placement]);
    select(placement.id);
    setMobilePanel("properties");
  };

  const move = (id: string, x: number, z: number) => {
    const placement = project.placements.find((item) => item.id === id);
    const asset = placement ? furnitureAssets.find((item) => item.id === placement.assetId) : null;
    if (!placement || !asset) return;
    let nextX = x;
    let nextZ = z;
    if (snapWall) {
      if (x < asset.width / 2 + 0.18) nextX = asset.width / 2;
      if (project.room.width - x < asset.width / 2 + 0.18) nextX = project.room.width - asset.width / 2;
      if (z < asset.depth / 2 + 0.18) nextZ = asset.depth / 2;
      if (project.room.length - z < asset.depth / 2 + 0.18) nextZ = project.room.length - asset.depth / 2;
    }
    replacePlacement(id, { x: Number(nextX.toFixed(2)), z: Number(nextZ.toFixed(2)) });
  };

  const rotate = (amount: number) => {
    if (!selected || selected.locked) return;
    const increment = snapRotation ? amount : Math.sign(amount) * 1;
    replacePlacement(selected.id, { rotation: normalizeRotation(selected.rotation + increment) });
  };

  const removeSelected = () => {
    if (!selected) return;
    updatePlacements(project.placements.filter((item) => item.id !== selected.id));
    select(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: createId("placement"), x: selected.x + 0.25, z: selected.z + 0.25, locked: false };
    updatePlacements([...project.placements, copy]);
    select(copy.id);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches("input, textarea, select")) return;
      if (event.key.toLowerCase() === "q") rotate(-15);
      if (event.key.toLowerCase() === "e") rotate(15);
      if (event.key === "Delete" || event.key === "Backspace") removeSelected();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const setView = (mode: CameraState["mode"]) => {
    if (mode === "top") setCamera({ yaw: 0, pitch: 0, zoom: 0.8, panX: 0, panY: 0, mode });
    else if (mode === "walk") setCamera({ yaw: -5, pitch: 68, zoom: 1.22, panX: 0, panY: 72, mode });
    else setCamera({ yaw: -8, pitch: 55, zoom: 0.92, panX: 0, panY: 10, mode });
  };

  return (
    <div className="editor-page">
      <header className="editor-topbar">
        <div className="editor-brand"><Brand compact /><button onClick={() => navigate("projects")}>‹</button><div><b>{project.name}</b><span>บันทึกในอุปกรณ์นี้</span></div></div>
        <div className="history-controls"><button onClick={undo} disabled={!historyCount} title="ย้อนกลับ (Ctrl+Z)">↶</button><button onClick={redo} disabled={!futureCount} title="ทำซ้ำ">↷</button></div>
        <div className="view-switcher"><button className={camera.mode === "orbit" ? "active" : ""} onClick={() => setView("orbit")}>◇ 3D</button><button className={camera.mode === "top" ? "active" : ""} onClick={() => setView("top")}>▦ ด้านบน</button><button className={camera.mode === "walk" ? "active" : ""} onClick={() => setView("walk")}>⌾ Preview</button></div>
        <div className="editor-actions"><button className="assistant-button" onClick={() => setAssistantOpen(true)}>✦ <span>ผู้ช่วย</span></button><button className="button button-dark save-button" onClick={() => saveProject()}><span>บันทึก</span>{warnings.length > 0 && <b>{warnings.length}</b>}</button></div>
      </header>

      <div className="editor-body">
        <aside className={`library-panel ${mobilePanel === "library" ? "mobile-open" : ""}`}>
          <div className="panel-title"><div><span>LIBRARY</span><h2>เฟอร์นิเจอร์</h2></div><button className="mobile-close" onClick={() => setMobilePanel(null)}>×</button></div>
          <label className="library-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเฟอร์นิเจอร์" /></label>
          <div className="category-tabs">{categories.map(([id, label]) => <button key={id} className={category === id ? "active" : ""} onClick={() => setCategory(id)}>{label}</button>)}</div>
          <div className="asset-grid">{visibleAssets.map((asset) => <button key={asset.id} className="asset-card" onClick={() => addAsset(asset)}><span style={{ "--asset": asset.color } as CSSProperties}><i>{asset.thumbnail}</i><b>＋</b><em>3D</em></span><strong>{asset.name}</strong><small>{Math.round(asset.width * 100)} × {Math.round(asset.depth * 100)} ซม.</small></button>)}</div>
          {!visibleAssets.length && <div className="panel-empty">ไม่พบเฟอร์นิเจอร์ที่ค้นหา</div>}
        </aside>

        <section className="canvas-section">
          <RoomCanvas camera={camera} setCamera={setCamera} onMove={move} />
          <div className="camera-tools"><button onClick={() => setCamera({ yaw: -8, pitch: 55, zoom: 0.92, panX: 0, panY: 10, mode: "orbit" })} title="รีเซ็ตกล้อง">⌂</button><span /><button onClick={() => setCamera({ ...camera, zoom: Math.min(1.75, camera.zoom + 0.12) })}>＋</button><button onClick={() => setCamera({ ...camera, zoom: Math.max(0.58, camera.zoom - 0.12) })}>−</button></div>
          <div className="editor-status"><span><i className="status-ok" /> {project.room.width} × {project.room.length} × {project.room.height} ม.</span><span className={warnings.length ? "status-warning" : ""}>{warnings.length ? `⚠ ${warnings.length} คำเตือน` : "✓ ไม่พบการชน"}</span><span>Snap {snapWall ? "เปิด" : "ปิด"}</span></div>
        </section>

        <aside className={`properties-panel ${mobilePanel === "properties" ? "mobile-open" : ""}`}>
          <div className="panel-title"><div><span>PROPERTIES</span><h2>{selectedAsset?.name ?? "ข้อมูลห้อง"}</h2></div><button className="mobile-close" onClick={() => setMobilePanel(null)}>×</button></div>
          {selected && selectedAsset ? <>
            <div className="selected-preview"><span style={{ background: selectedAsset.color }}>{selectedAsset.thumbnail}</span><div><b>{selectedAsset.name}</b><small>{selectedAsset.category.toUpperCase()}</small></div></div>
            <section className="property-section"><h3>ตำแหน่ง <small>เมตร</small></h3><div className="axis-inputs"><label><span className="x-axis">X</span><input type="number" step="0.05" value={selected.x} onChange={(event) => move(selected.id, Number(event.target.value), selected.z)} /></label><label><span className="z-axis">Z</span><input type="number" step="0.05" value={selected.z} onChange={(event) => move(selected.id, selected.x, Number(event.target.value))} /></label></div></section>
            <section className="property-section"><h3>การหมุน <small>Q / E</small></h3><div className="rotation-control"><button onClick={() => rotate(-15)} aria-label="หมุนซ้าย 15 องศา">↶ 15°</button><output>{selected.rotation}°</output><button onClick={() => rotate(15)} aria-label="หมุนขวา 15 องศา">15° ↷</button></div><div className="rotation-quick"><button onClick={() => rotate(-90)}>↶ ซ้าย 90°</button><button className="rotate-right-angle" onClick={() => rotate(90)}>ขวา 90° ↷</button></div><label className="toggle-row"><span>Snap ครั้งละ 15°</span><input type="checkbox" checked={snapRotation} onChange={(event) => setSnapRotation(event.target.checked)} /></label></section>
            <section className="property-section"><h3>ขนาดจริง</h3><div className="measure-grid"><span><small>กว้าง</small><b>{selectedAsset.width} ม.</b></span><span><small>ลึก</small><b>{selectedAsset.depth} ม.</b></span><span><small>สูง</small><b>{selectedAsset.height} ม.</b></span></div></section>
            {warnings.filter((item) => item.placementId === selected.id).map((warning) => <div className={`object-warning ${warning.severity}`} key={warning.id}>⚠ <span>{warning.message}</span></div>)}
            <label className="toggle-row"><span>Snap ชิดผนัง</span><input type="checkbox" checked={snapWall} onChange={(event) => setSnapWall(event.target.checked)} /></label>
            <label className="toggle-row"><span>ล็อกตำแหน่ง</span><input type="checkbox" checked={selected.locked} onChange={(event) => replacePlacement(selected.id, { locked: event.target.checked })} /></label>
            <div className="object-actions"><button onClick={duplicateSelected}>⧉ ทำสำเนา</button><button className="danger" onClick={removeSelected}>⌫ ลบ</button></div>
          </> : <>
            <section className="room-properties"><div className="room-measure"><span>{project.room.width}<small>ม. กว้าง</small></span><b>×</b><span>{project.room.length}<small>ม. ยาว</small></span></div><p>สูง {project.room.height} เมตร · {project.roomType}</p></section>
            <section className="property-section"><h3>ค่าแนะนำทางเดิน</h3><input className="range" type="range" min="0.45" max="1.2" step="0.05" value={project.walkwayClearance} onChange={(event) => setProject({ ...project, walkwayClearance: Number(event.target.value) })} /><div className="range-value"><span>45 ซม.</span><b>{Math.round(project.walkwayClearance * 100)} ซม.</b><span>120 ซม.</span></div><p className="property-note">เป็นค่าแนะนำที่ปรับได้ ไม่ใช่มาตรฐานทางกฎหมาย</p></section>
            <section className="warning-list"><h3>สถานะพื้นที่ <b>{warnings.length}</b></h3>{warnings.length ? warnings.slice(0, 6).map((warning) => <button key={warning.id} onClick={() => select(warning.placementId)}>⚠ {warning.message}<span>→</span></button>) : <div className="all-clear"><span>✓</span><div><b>พื้นที่พร้อมใช้งาน</b><small>ไม่พบการชนหรือกีดขวาง</small></div></div>}</section>
          </>}
          <button className="button button-primary next-step" onClick={() => navigate("spec")}>สร้างสเปกสินค้า <span>→</span></button>
        </aside>
      </div>

      <nav className="mobile-editor-toolbar"><button onClick={() => setMobilePanel("library")}><span>＋</span>เพิ่มของ</button><button onClick={() => rotate(-90)}><span>↶</span>ซ้าย 90°</button><button onClick={() => rotate(90)}><span>↷</span>ขวา 90°</button><button onClick={() => setMobilePanel("properties")}><span>☷</span>รายละเอียด</button></nav>
      {mobilePanel && <button className="sheet-backdrop" onClick={() => setMobilePanel(null)} aria-label="ปิดแผง" />}
      <AssistantPanel />
    </div>
  );
}
