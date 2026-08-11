"use client";

import { useState, type FormEvent } from "react";
import { useFursign } from "@/features/projects/FursignContext";

export function AssistantPanel() {
  const { project, warnings, assistantOpen, setAssistantOpen } = useFursign();
  const [messages, setMessages] = useState([{ role: "assistant", text: "สวัสดีค่ะ ฉันช่วยอ่านข้อมูลจากห้องและคำเตือนได้ ลองถามว่า ‘โต๊ะขวางประตูไหม’" }]);
  const [input, setInput] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    const lower = question.toLowerCase();
    let answer = `ห้องนี้เป็นสไตล์ ${project.style} งบ ${project.budget.toLocaleString("th-TH")} บาท และมีเฟอร์นิเจอร์ ${project.placements.length} ชิ้น`;
    if (lower.includes("ประตู") || lower.includes("ชน")) answer = warnings.length ? `พบ ${warnings.length} คำเตือน: ${[...new Set(warnings.map((item) => item.message))].join(" และ ")}` : "ไม่พบวัตถุชนกันหรือกีดขวางประตูในตำแหน่งปัจจุบัน";
    if (lower.includes("minimal") || lower.includes("งบ")) answer = "ฉันจะใช้สไตล์และงบของโปรเจกต์ช่วยจัดอันดับ แต่สินค้าต้องผ่านเงื่อนไขขนาดจาก Geometry Engine ก่อนเสมอ";
    if (lower.includes("ขาด")) answer = "ฉันยังไม่เดาว่าห้องจำเป็นต้องมีอะไรเพิ่ม คุณสามารถเลือกหมวดที่ต้องการซื้อในหน้าสเปกได้";
    setMessages((current) => [...current, { role: "user", text: question }, { role: "assistant", text: answer }]);
    setInput("");
  };

  if (!assistantOpen) return null;
  return (
    <aside className="assistant-panel">
      <header><div><span>✦</span><div><b>Fursign Assist</b><small>Rule-based prototype</small></div></div><button onClick={() => setAssistantOpen(false)}>×</button></header>
      <div className="assistant-messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div>
      <div className="suggestions"><button onClick={() => setInput("โต๊ะตัวนี้ขวางประตูไหม")}>ขวางประตูไหม?</button><button onClick={() => setInput("ห้องยังขาดอะไร")}>ห้องยังขาดอะไร?</button></div>
      <form onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="ถามเกี่ยวกับห้องนี้…" aria-label="คำถามสำหรับผู้ช่วย" /><button>↑</button></form>
    </aside>
  );
}
