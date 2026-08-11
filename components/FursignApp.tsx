"use client";

import { lazy, Suspense } from "react";
import { FursignProvider, useFursign } from "@/features/projects/FursignContext";
import { LandingView } from "@/components/views/LandingView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { SetupView } from "@/components/views/SetupView";
import { SpecificationView } from "@/components/views/SpecificationView";
import { RecommendationsView } from "@/components/views/RecommendationsView";
import { MerchantView } from "@/components/views/MerchantView";

const EditorView = lazy(() => import("@/components/room-editor/EditorView").then((module) => ({ default: module.EditorView })));

function EditorLoading() {
  return <div className="editor-loading" role="status"><span>F</span><div><b>กำลังเปิด Room Editor</b><i /></div></div>;
}

function ProductRouter() {
  const { view, toast } = useFursign();
  return (
    <main className={`app-shell view-${view}`}>
      {view === "landing" && <LandingView />}
      {view === "projects" && <ProjectsView />}
      {view === "setup" && <SetupView />}
      {view === "editor" && <Suspense fallback={<EditorLoading />}><EditorView /></Suspense>}
      {view === "spec" && <SpecificationView />}
      {view === "recommendations" && <RecommendationsView />}
      {view === "merchant" && <MerchantView />}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}

export function FursignApp() {
  return <FursignProvider><ProductRouter /></FursignProvider>;
}
