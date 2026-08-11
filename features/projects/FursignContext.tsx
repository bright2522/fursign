"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoProject, furnitureAssets } from "@/data/catalog";
import { calculateWarnings, createId } from "@/lib/engine.mjs";
import { parseProjects, serializeProjects } from "@/lib/storage.mjs";
import type { FurniturePlacement, Project, RoomWarning, ViewName } from "@/types/fursign";

const STORAGE_KEY = "fursign.projects.v1";

interface FursignState {
  view: ViewName;
  project: Project;
  projects: Project[];
  selectedId: string | null;
  warnings: RoomWarning[];
  toast: string;
  historyCount: number;
  futureCount: number;
  assistantOpen: boolean;
  setAssistantOpen(value: boolean): void;
  navigate(view: ViewName): void;
  setProject(project: Project): void;
  select(id: string | null): void;
  updatePlacements(placements: FurniturePlacement[]): void;
  saveProject(message?: string): void;
  openProject(id: string): void;
  duplicateProject(id: string): void;
  deleteProject(id: string): void;
  undo(): void;
  redo(): void;
  notify(message: string): void;
}

const FursignContext = createContext<FursignState | null>(null);

const cloneProject = (project: Project): Project => JSON.parse(JSON.stringify(project)) as Project;

export function FursignProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewName>("landing");
  const [project, setProjectState] = useState<Project>(demoProject);
  const [projects, setProjects] = useState<Project[]>([demoProject]);
  const [selectedId, setSelectedId] = useState<string | null>(demoProject.placements[0]?.id ?? null);
  const [past, setPast] = useState<FurniturePlacement[][]>([]);
  const [future, setFuture] = useState<FurniturePlacement[][]>([]);
  const [toast, setToast] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseProjects(stored);
          if (Array.isArray(parsed) && parsed.length) {
            setProjects(parsed);
            setProjectState(parsed[0]);
          }
        } else {
          window.localStorage.setItem(STORAGE_KEY, serializeProjects([demoProject]));
        }
      } catch {
        setToast("ไม่สามารถอ่านข้อมูลเดิมได้ จึงเปิดโปรเจกต์ตัวอย่างแทน");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const warnings = useMemo(
    () => calculateWarnings(project, furnitureAssets),
    [project],
  );

  const notify = useCallback((message: string) => setToast(message), []);

  const navigate = useCallback((next: ViewName) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setProject = useCallback((next: Project) => {
    setProjectState(next);
    setSelectedId(next.placements[0]?.id ?? null);
    setPast([]);
    setFuture([]);
  }, []);

  const updatePlacements = useCallback((placements: FurniturePlacement[]) => {
    setProjectState((current) => {
      setPast((items) => [...items.slice(-19), current.placements]);
      setFuture([]);
      return { ...current, placements, updatedAt: new Date().toISOString() };
    });
  }, []);

  const saveProject = useCallback((message = "บันทึกโปรเจกต์แล้ว") => {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    setProjectState(updated);
    setProjects((current) => {
      const next = [updated, ...current.filter((item) => item.id !== updated.id)];
      window.localStorage.setItem(STORAGE_KEY, serializeProjects(next));
      return next;
    });
    notify(message);
  }, [notify, project]);

  const openProject = useCallback((id: string) => {
    const found = projects.find((item) => item.id === id);
    if (!found) return;
    setProject(cloneProject(found));
    setView("editor");
  }, [projects, setProject]);

  const duplicateProject = useCallback((id: string) => {
    const source = projects.find((item) => item.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy = { ...cloneProject(source), id: createId("project"), name: `${source.name} (สำเนา)`, createdAt: now, updatedAt: now };
    const next = [copy, ...projects];
    setProjects(next);
    window.localStorage.setItem(STORAGE_KEY, serializeProjects(next));
    notify("สร้างสำเนาโปรเจกต์แล้ว");
  }, [notify, projects]);

  const deleteProject = useCallback((id: string) => {
    if (!window.confirm("ลบโปรเจกต์นี้ใช่หรือไม่? การดำเนินการนี้ย้อนกลับไม่ได้")) return;
    const next = projects.filter((item) => item.id !== id);
    setProjects(next.length ? next : [demoProject]);
    window.localStorage.setItem(STORAGE_KEY, serializeProjects(next.length ? next : [demoProject]));
    notify("ลบโปรเจกต์แล้ว");
  }, [notify, projects]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setFuture((items) => [project.placements, ...items].slice(0, 20));
    setPast((items) => items.slice(0, -1));
    setProjectState((current) => ({ ...current, placements: previous }));
  }, [past, project.placements]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setPast((items) => [...items, project.placements].slice(-20));
    setFuture((items) => items.slice(1));
    setProjectState((current) => ({ ...current, placements: next }));
  }, [future, project.placements]);

  return (
    <FursignContext.Provider value={{
      view,
      project,
      projects,
      selectedId,
      warnings,
      toast,
      historyCount: past.length,
      futureCount: future.length,
      assistantOpen,
      setAssistantOpen,
      navigate,
      setProject,
      select: setSelectedId,
      updatePlacements,
      saveProject,
      openProject,
      duplicateProject,
      deleteProject,
      undo,
      redo,
      notify,
    }}>
      {children}
    </FursignContext.Provider>
  );
}

export function useFursign() {
  const context = useContext(FursignContext);
  if (!context) throw new Error("useFursign must be used inside FursignProvider");
  return context;
}
