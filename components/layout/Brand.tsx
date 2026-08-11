"use client";

import { useFursign } from "@/features/projects/FursignContext";

export function Brand({ compact = false }: { compact?: boolean }) {
  const { navigate } = useFursign();
  return (
    <button className="brand" onClick={() => navigate("landing")} aria-label="กลับหน้าแรก Fursign">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span>Fursign<small>space, measured.</small></span>}
    </button>
  );
}

export function PublicNav() {
  const { navigate } = useFursign();
  return (
    <nav className="public-nav" aria-label="เมนูหลัก">
      <Brand />
      <div className="public-nav-links">
        <button onClick={() => navigate("projects")}>โปรเจกต์ของฉัน</button>
        <button onClick={() => navigate("merchant")}>สำหรับร้านค้า</button>
        <button className="button button-dark" onClick={() => navigate("setup")}>Get Started ↗</button>
      </div>
    </nav>
  );
}
