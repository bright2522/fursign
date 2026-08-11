"use client";

import { PublicNav } from "@/components/layout/Brand";
import { useFursign } from "@/features/projects/FursignContext";

const steps = [
  ["01", "Capture", "กำหนดขนาดจริงของห้อง ประตู และหน้าต่าง"],
  ["02", "Design", "จัดวางและหมุนเฟอร์นิเจอร์ในพื้นที่ 3 มิติ"],
  ["03", "Generate spec", "คำนวณขนาดสูงสุดจากพื้นที่จริง"],
  ["04", "Recommend", "เลือกสินค้าที่ใส่ได้จริงก่อนตัดสินใจซื้อ"],
];

export function LandingView() {
  const { navigate, openProject } = useFursign();
  return (
    <div className="landing-page">
      <PublicNav />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> เครื่องมือออกแบบพื้นที่ก่อนซื้อจริง</p>
          <h1>ออกแบบห้อง<br />ก่อนซื้อ<em>เฟอร์นิเจอร์</em></h1>
          <p className="hero-lead">เปลี่ยนขนาดห้องจริงให้เป็นพื้นที่ทดลอง วางของให้พอดี ตรวจทางเปิดประตู และพบสินค้าที่เหมาะกับบ้านคุณ</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => navigate("setup")}>เริ่มออกแบบห้อง <span>→</span></button>
            <button className="text-button" onClick={() => openProject("demo-living-room")}><span className="play-dot">▶</span> ทดลองห้องตัวอย่าง</button>
          </div>
          <div className="trust-row">
            <span><b>24+</b> เฟอร์นิเจอร์จำลอง</span>
            <span><b>30</b> สินค้าทดลอง</span>
            <span><b>100%</b> ทำงานในเครื่องคุณ</span>
          </div>
        </div>
        <div className="hero-room" aria-label="ตัวอย่างห้องนั่งเล่นสามมิติ">
          <div className="room-label"><span>ห้องนั่งเล่น · 4.6 × 5.2 ม.</span><b>FIT</b></div>
          <div className="isometric-room">
            <div className="iso-wall wall-back"><span className="iso-window" /></div>
            <div className="iso-wall wall-side" />
            <div className="iso-floor">
              <span className="iso-rug" />
              <span className="iso-sofa" />
              <span className="iso-table" />
              <span className="iso-chair" />
              <span className="iso-plant">✦</span>
            </div>
          </div>
          <div className="dimension-note note-width"><i /> 4.60 ม.</div>
          <div className="dimension-note note-clearance"><i /> ทางเดิน 82 ซม. <b>ผ่าน</b></div>
          <div className="cursor-note">วางได้พอดี <span>✓</span></div>
        </div>
      </section>
      <section className="process-section">
        <div className="section-heading"><p className="eyebrow"><span /> จากพื้นที่จริงสู่การตัดสินใจ</p><h2>วัดครั้งเดียว<br />เลือกได้อย่างมั่นใจ</h2></div>
        <div className="process-grid">
          {steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>
      <section className="feature-band">
        <div><p className="eyebrow light"><span /> ไม่ต้องเดาอีกต่อไป</p><h2>ห้องจริง<br />ขนาดจริง<br /><em>คำแนะนำที่วัดได้</em></h2></div>
        <div className="feature-list">
          <article><b>01</b><div><h3>เตือนก่อนของชน</h3><p>ตรวจขอบวัตถุ ผนัง และพื้นที่เปิดประตูแบบทันที</p></div></article>
          <article><b>02</b><div><h3>สเปกจากพื้นที่จริง</h3><p>คำนวณขนาดสินค้า ไม่ใช้การเดาจาก AI</p></div></article>
          <article><b>03</b><div><h3>ข้อมูลอยู่กับคุณ</h3><p>Prototype บันทึกโปรเจกต์ไว้ในอุปกรณ์นี้</p></div></article>
        </div>
      </section>
      <footer className="site-footer"><button className="footer-brand" onClick={() => navigate("landing")}><span>F</span> Fursign</button><p>Prototype สำหรับการตรวจสอบแนวคิด · © 2026 Fursign</p></footer>
    </div>
  );
}
