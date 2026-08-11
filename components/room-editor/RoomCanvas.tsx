"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { furnitureAssets } from "@/data/catalog";
import { useFursign } from "@/features/projects/FursignContext";

export interface CameraState { yaw: number; pitch: number; zoom: number; panX: number; panY: number; mode: "orbit" | "top" | "walk" }

export function RoomCanvas({ camera, setCamera, onMove }: { camera: CameraState; setCamera: (value: CameraState) => void; onMove: (id: string, x: number, z: number) => void }) {
  const { project, selectedId, select, warnings } = useFursign();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ kind: "camera" | "object"; id?: string; startX: number; startY: number; x?: number; z?: number; button: number } | null>(null);
  const [draft, setDraft] = useState<{ id: string; x: number; z: number } | null>(null);

  useEffect(() => {
    const stopMenu = (event: MouseEvent) => event.preventDefault();
    const node = stageRef.current;
    node?.addEventListener("contextmenu", stopMenu);
    return () => node?.removeEventListener("contextmenu", stopMenu);
  }, []);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".placed-furniture")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "camera", startX: event.clientX, startY: event.clientY, button: event.button };
    select(null);
  };

  const objectDown = (event: ReactPointerEvent<HTMLButtonElement>, id: string, x: number, z: number, locked: boolean) => {
    event.stopPropagation();
    select(id);
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "object", id, startX: event.clientX, startY: event.clientY, x, z, button: event.button };
  };

  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.kind === "camera") {
      if (drag.button === 2 || event.shiftKey) setCamera({ ...camera, panX: camera.panX + dx, panY: camera.panY + dy });
      else setCamera({ ...camera, yaw: camera.yaw + dx * 0.35, pitch: Math.max(18, Math.min(72, camera.pitch - dy * 0.22)), mode: "orbit" });
      dragRef.current = { ...drag, startX: event.clientX, startY: event.clientY };
    } else if (drag.id && drag.x !== undefined && drag.z !== undefined && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const nextX = Math.max(-0.5, Math.min(project.room.width + 0.5, drag.x + (dx / rect.width) * project.room.width * 1.45));
      const nextZ = Math.max(-0.5, Math.min(project.room.length + 0.5, drag.z + (dy / rect.height) * project.room.length * 1.45));
      setDraft({ id: drag.id, x: Number(nextX.toFixed(2)), z: Number(nextZ.toFixed(2)) });
    }
  };

  const pointerUp = () => {
    if (draft) onMove(draft.id, draft.x, draft.z);
    dragRef.current = null;
    setDraft(null);
  };

  const zoom = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setCamera({ ...camera, zoom: Math.max(0.58, Math.min(1.75, camera.zoom - event.deltaY * 0.001)) });
  };

  const transform = camera.mode === "top"
    ? `translate(${camera.panX}px, ${camera.panY}px) rotateX(0deg) rotateZ(0deg) scale(${camera.zoom * 0.88})`
    : `translate(${camera.panX}px, ${camera.panY}px) rotateX(${camera.mode === "walk" ? 68 : camera.pitch}deg) rotateZ(${camera.yaw}deg) scale(${camera.zoom})`;

  return (
    <div className="room-canvas" ref={stageRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={zoom}>
      <div className="canvas-hint"><span>ลากเพื่อหมุน</span><span>⇧ + ลาก เพื่อเลื่อน</span><span>Scroll เพื่อซูม</span></div>
      <div className="north-mark">N</div>
      <div className="room-world" style={{ transform }}>
        <div className="room-floor" style={{ "--room-ratio": `${project.room.width / project.room.length}` } as CSSProperties}>
          <div className="floor-grid" />
          <div className="wall wall-north" /><div className="wall wall-west" />
          {project.room.doors.map((door) => (
            <div key={door.id} className="door-clearance" style={{ left: `${((door.offset - door.width / 2) / project.room.width) * 100}%`, top: 0, width: `${(door.width / project.room.width) * 100}%`, height: `${(door.width / project.room.length) * 100}%` }}><span>door sweep</span></div>
          ))}
          {project.placements.map((placement) => {
            const asset = furnitureAssets.find((item) => item.id === placement.assetId)!;
            const current = draft?.id === placement.id ? { ...placement, x: draft.x, z: draft.z } : placement;
            const objectWarnings = warnings.filter((warning) => warning.placementId === placement.id);
            const hasError = objectWarnings.some((warning) => warning.severity === "error");
            const style = {
              left: `${(current.x / project.room.width) * 100}%`,
              top: `${(current.z / project.room.length) * 100}%`,
              width: `${(asset.width / project.room.width) * 100}%`,
              height: `${(asset.depth / project.room.length) * 100}%`,
              "--furniture-color": asset.color,
              "--object-height": `${Math.max(8, asset.height * 15)}px`,
              transform: `translate(-50%, -50%) rotate(${current.rotation}deg)`,
            } as CSSProperties;
            return (
              <button key={placement.id} className={`placed-furniture ${selectedId === placement.id ? "selected" : ""} ${hasError ? "invalid" : ""} ${placement.locked ? "locked" : ""}`} style={style} onPointerDown={(event) => objectDown(event, placement.id, placement.x, placement.z, placement.locked)} aria-label={`${asset.name} ที่ตำแหน่ง ${current.x}, ${current.z} เมตร`}>
                <span className="object-top"><b>{asset.thumbnail}</b></span>
                {selectedId === placement.id && <><i className="handle handle-a" /><i className="handle handle-b" /><em>{asset.width} × {asset.depth} ม.</em></>}
                {placement.locked && <small>⌾</small>}
              </button>
            );
          })}
          <span className="dimension dimension-x">{project.room.width.toFixed(1)} ม.</span>
          <span className="dimension dimension-z">{project.room.length.toFixed(1)} ม.</span>
        </div>
      </div>
      {!project.placements.length && <div className="canvas-empty"><span>＋</span><h3>ห้องพร้อมแล้ว</h3><p>เลือกเฟอร์นิเจอร์จากคลังเพื่อเริ่มจัดวาง</p></div>}
      <div className="axis-widget"><i className="axis-y" /><i className="axis-x" /><span>Y</span><b>X</b></div>
    </div>
  );
}
