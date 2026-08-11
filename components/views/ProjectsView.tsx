"use client";

import { Brand } from "@/components/layout/Brand";
import { useFursign } from "@/features/projects/FursignContext";

export function ProjectsView() {
  const { projects, navigate, openProject, duplicateProject, deleteProject } = useFursign();
  return (
    <div className="workspace-page projects-page">
      <header className="workspace-header"><Brand /><div><button onClick={() => navigate("merchant")}>สำหรับร้านค้า</button><button className="button button-dark" onClick={() => navigate("setup")}>＋ โปรเจกต์ใหม่</button></div></header>
      <section className="projects-intro"><p className="eyebrow"><span /> พื้นที่ทำงานของคุณ</p><h1>โปรเจกต์ห้อง</h1><p>เปิดห้องเดิม หรือเริ่มกำหนดพื้นที่ใหม่จากขนาดจริง</p></section>
      <section className="project-grid">
        <button className="new-project-card" onClick={() => navigate("setup")}><span>＋</span><b>สร้างโปรเจกต์ใหม่</b><small>เริ่มจากขนาดห้อง</small></button>
        {projects.map((item) => (
          <article className="project-card" key={item.id}>
            <button className="project-thumb" onClick={() => openProject(item.id)} aria-label={`เปิด ${item.name}`}>
              <span className="mini-room"><i /><i /><i /></span>
              {item.id === "demo-living-room" && <b>DEMO</b>}
            </button>
            <div className="project-info"><div><h2>{item.name}</h2><p>{item.room.width} × {item.room.length} ม. · แก้ไข {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</p></div>
              <div className="card-actions"><button onClick={() => duplicateProject(item.id)} title="ทำสำเนา">⧉</button><button onClick={() => deleteProject(item.id)} title="ลบ">⌫</button><button className="open-arrow" onClick={() => openProject(item.id)}>→</button></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
