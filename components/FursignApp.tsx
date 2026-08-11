"use client";

import { FursignProvider, useFursign } from "@/features/projects/FursignContext";
import { LandingView } from "@/components/views/LandingView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { SetupView } from "@/components/views/SetupView";
import { EditorView } from "@/components/room-editor/EditorView";
import { SpecificationView } from "@/components/views/SpecificationView";
import { RecommendationsView } from "@/components/views/RecommendationsView";
import { MerchantView } from "@/components/views/MerchantView";

function ProductRouter() {
  const { view, toast } = useFursign();
  return (
    <main className={`app-shell view-${view}`}>
      {view === "landing" && <LandingView />}
      {view === "projects" && <ProjectsView />}
      {view === "setup" && <SetupView />}
      {view === "editor" && <EditorView />}
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
