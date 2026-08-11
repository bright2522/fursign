"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { furnitureAssets } from "@/data/catalog";
import { useFursign } from "@/features/projects/FursignContext";
import type { Door, FurnitureAsset, WindowOpening } from "@/types/fursign";

export interface CameraState { yaw: number; pitch: number; zoom: number; panX: number; panY: number; mode: "orbit" | "top" | "walk" }

interface SceneState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  floor: THREE.Mesh;
  roomGroup: THREE.Group;
  furnitureGroup: THREE.Group;
  objectGroups: Map<string, THREE.Group>;
  selection: THREE.BoxHelper | null;
  animationId: number;
}

type DragState =
  | { kind: "camera"; startX: number; startY: number; button: number }
  | { kind: "object"; id: string; offsetX: number; offsetZ: number; lastX: number; lastZ: number };

const modelCache = new Map<string, Promise<THREE.Group>>();

function loadModel(url: string) {
  if (!modelCache.has(url)) {
    modelCache.set(url, new Promise((resolve, reject) => new FBXLoader().load(url, resolve, undefined, reject)));
  }
  return modelCache.get(url)!;
}

function disposeTree(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

function fitModel(source: THREE.Group, asset: FurnitureAsset) {
  const model = source.clone(true);
  const initial = new THREE.Box3().setFromObject(model);
  const size = initial.getSize(new THREE.Vector3());
  model.scale.set(
    asset.width / Math.max(size.x, 0.001),
    asset.height / Math.max(size.y, 0.001),
    asset.depth / Math.max(size.z, 0.001),
  );
  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -fitted.min.y, -center.z);
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry = child.geometry.clone();
    child.material = Array.isArray(child.material) ? child.material.map((material) => material.clone()) : child.material.clone();
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if ("roughness" in material) (material as THREE.MeshStandardMaterial).roughness = 0.78;
    });
  });
  return model;
}

function wallPoint(wall: Door["wall"], offset: number, width: number, length: number) {
  if (wall === "north") return { x: -width / 2 + offset, z: -length / 2, rotation: 0 };
  if (wall === "south") return { x: -width / 2 + offset, z: length / 2, rotation: 0 };
  if (wall === "west") return { x: -width / 2, z: -length / 2 + offset, rotation: Math.PI / 2 };
  return { x: width / 2, z: -length / 2 + offset, rotation: Math.PI / 2 };
}

function makeOpeningPanel(opening: Door | WindowOpening, width: number, length: number, kind: "door" | "window") {
  const point = wallPoint(opening.wall, opening.offset, width, length);
  if (opening.wall === "north") point.z += 0.055;
  if (opening.wall === "south") point.z -= 0.055;
  if (opening.wall === "west") point.x += 0.055;
  if (opening.wall === "east") point.x -= 0.055;
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(opening.width, opening.height, 0.055),
    new THREE.MeshStandardMaterial({
      color: kind === "door" ? 0xb77652 : 0x96b8bd,
      transparent: true,
      opacity: kind === "door" ? 0.8 : 0.62,
      roughness: 0.72,
    }),
  );
  const base = kind === "window" ? (opening as WindowOpening).sillHeight : 0;
  panel.position.set(point.x, base + opening.height / 2, point.z);
  panel.rotation.y = point.rotation;
  panel.renderOrder = 3;
  return panel;
}

function makeDoorSweep(door: Door, width: number, length: number) {
  const point = wallPoint(door.wall, door.offset, width, length);
  const geometry = new THREE.CircleGeometry(door.width, 32, 0, Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xd08a32, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false });
  const sweep = new THREE.Mesh(geometry, material);
  sweep.rotation.x = -Math.PI / 2;
  sweep.rotation.z = point.rotation + (door.swing === "left" ? Math.PI / 2 : 0);
  sweep.position.set(point.x, 0.012, point.z);
  return sweep;
}

export function RoomCanvas({ camera, setCamera, onMove }: { camera: CameraState; setCamera: (value: CameraState) => void; onMove: (id: string, x: number, z: number) => void }) {
  const { project, selectedId, select, warnings } = useFursign();
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const cameraRef = useRef(camera);
  const projectRef = useRef(project);
  const onMoveRef = useRef(onMove);
  const [modelsLoading, setModelsLoading] = useState(0);

  useEffect(() => {
    cameraRef.current = camera;
    projectRef.current = project;
    onMoveRef.current = onMove;
  }, [camera, project, onMove]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe3e6e1);
    scene.fog = new THREE.Fog(0xe3e6e1, 12, 32);
    const camera3d = new THREE.PerspectiveCamera(42, 1, 0.05, 80);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "three-room-canvas";
    renderer.domElement.setAttribute("aria-label", "ห้องสามมิติที่ลากเฟอร์นิเจอร์ตามเมาส์ได้");
    host.prepend(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xfffcf2, 0x667068, 2.25);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff1d8, 2.1);
    sun.position.set(3.5, 7, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -7; sun.shadow.camera.right = 7; sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
    scene.add(sun);
    const roomGroup = new THREE.Group();
    const furnitureGroup = new THREE.Group();
    scene.add(roomGroup, furnitureGroup);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xd1ad85, roughness: 0.93 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const state: SceneState = { scene, camera: camera3d, renderer, floor, roomGroup, furnitureGroup, objectGroups: new Map(), selection: null, animationId: 0 };
    sceneRef.current = state;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera3d.aspect = rect.width / rect.height;
      camera3d.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const animate = () => { state.animationId = requestAnimationFrame(animate); renderer.render(scene, camera3d); };
    animate();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(state.animationId);
      disposeTree(scene);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const { width, length, height, doors, windows } = project.room;
    const keep = new Set<THREE.Object3D>([state.floor, state.furnitureGroup]);
    [...state.roomGroup.children].forEach((child) => {
      if (keep.has(child)) return;
      state.roomGroup.remove(child);
      disposeTree(child);
    });
    state.floor.geometry.dispose();
    state.floor.geometry = new THREE.PlaneGeometry(width, length);

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x92765d, transparent: true, opacity: 0.28 });
    const points: THREE.Vector3[] = [];
    for (let x = -width / 2; x <= width / 2 + 0.001; x += 0.5) points.push(new THREE.Vector3(x, 0.006, -length / 2), new THREE.Vector3(x, 0.006, length / 2));
    for (let z = -length / 2; z <= length / 2 + 0.001; z += 0.5) points.push(new THREE.Vector3(-width / 2, 0.006, z), new THREE.Vector3(width / 2, 0.006, z));
    const gridGeometry = new THREE.BufferGeometry().setFromPoints(points);
    state.roomGroup.add(new THREE.LineSegments(gridGeometry, gridMaterial));

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf0ede5, roughness: 0.88, side: THREE.DoubleSide });
    const north = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, height, 0.09), wallMaterial.clone());
    north.position.set(0, height / 2, -length / 2);
    const west = new THREE.Mesh(new THREE.BoxGeometry(0.09, height, length + 0.1), wallMaterial.clone());
    west.position.set(-width / 2, height / 2, 0);
    const southEdge = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, 0.14, 0.09), wallMaterial.clone());
    southEdge.position.set(0, 0.07, length / 2);
    const eastEdge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, length + 0.1), wallMaterial.clone());
    eastEdge.position.set(width / 2, 0.07, 0);
    [north, west, southEdge, eastEdge].forEach((wall) => { wall.receiveShadow = true; state.roomGroup.add(wall); });
    doors.forEach((door) => { state.roomGroup.add(makeOpeningPanel(door, width, length, "door"), makeDoorSweep(door, width, length)); });
    windows.forEach((windowOpening) => state.roomGroup.add(makeOpeningPanel(windowOpening, width, length, "window")));
  }, [project.room]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const room = project.room;
    const liveIds = new Set(project.placements.map((placement) => placement.id));
    for (const [id, group] of state.objectGroups) {
      if (liveIds.has(id)) continue;
      state.furnitureGroup.remove(group);
      disposeTree(group);
      state.objectGroups.delete(id);
    }
    project.placements.forEach((placement) => {
      const asset = furnitureAssets.find((item) => item.id === placement.assetId);
      if (!asset) return;
      let group = state.objectGroups.get(placement.id);
      if (!group) {
        group = new THREE.Group();
        group.userData.placementId = placement.id;
        const hitBox = new THREE.Mesh(
          new THREE.BoxGeometry(asset.width, asset.height, asset.depth),
          new THREE.MeshBasicMaterial({ color: asset.color, transparent: true, opacity: 0.13, depthWrite: false }),
        );
        hitBox.position.y = asset.height / 2;
        hitBox.userData.placementId = placement.id;
        group.add(hitBox);
        state.furnitureGroup.add(group);
        state.objectGroups.set(placement.id, group);
        if (asset.modelUrl) {
          setModelsLoading((value) => value + 1);
          const targetGroup = group;
          loadModel(asset.modelUrl).then((source) => {
            if (sceneRef.current?.objectGroups.get(placement.id) !== targetGroup) return;
            const fitted = fitModel(source, asset);
            fitted.userData.placementId = placement.id;
            targetGroup.add(fitted);
            const material = (targetGroup.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
            material.opacity = 0;
          }).catch(() => {
            const material = (targetGroup.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
            material.opacity = 0.5;
          }).finally(() => setModelsLoading((value) => Math.max(0, value - 1)));
        }
      }
      if (dragRef.current?.kind !== "object" || dragRef.current.id !== placement.id) {
        group.position.set(placement.x - room.width / 2, 0, placement.z - room.length / 2);
      }
      group.rotation.y = THREE.MathUtils.degToRad(-placement.rotation);
      group.userData.locked = placement.locked;
    });
  }, [project.placements, project.room]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    if (state.selection) { state.scene.remove(state.selection); state.selection.dispose(); state.selection = null; }
    const group = selectedId ? state.objectGroups.get(selectedId) : null;
    if (group) {
      state.selection = new THREE.BoxHelper(group, 0xd96545);
      state.selection.material.depthTest = false;
      state.selection.renderOrder = 10;
      state.scene.add(state.selection);
    }
    state.objectGroups.forEach((objectGroup, id) => {
      const hit = objectGroup.children[0] as THREE.Mesh;
      const material = hit?.material as THREE.MeshBasicMaterial | undefined;
      if (!material) return;
      const hasError = warnings.some((warning) => warning.placementId === id && warning.severity === "error");
      material.color.set(hasError ? 0xc94d3d : 0xffffff);
      material.opacity = hasError ? 0.22 : 0;
    });
  }, [selectedId, warnings]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const { width, length } = project.room;
    const span = Math.max(width, length);
    const narrowFit = state.camera.aspect < 0.78 ? 0.78 / Math.max(state.camera.aspect, 0.35) : 1;
    const target = new THREE.Vector3(camera.panX * -0.008, Math.max(0.15, camera.panY * -0.003 + 0.35), camera.panY * -0.006);
    if (camera.mode === "top") {
      state.camera.position.set(target.x, span * 1.6 * narrowFit / camera.zoom, target.z + 0.001);
      state.camera.up.set(0, 0, -1);
      state.camera.lookAt(target.x, 0, target.z);
    } else if (camera.mode === "walk") {
      const theta = THREE.MathUtils.degToRad(camera.yaw);
      state.camera.position.set(target.x, 1.55, length * 0.34 + target.z);
      state.camera.up.set(0, 1, 0);
      state.camera.lookAt(target.x + Math.sin(theta) * 3, 1.12, target.z - Math.cos(theta) * 3);
    } else {
      const theta = THREE.MathUtils.degToRad(camera.yaw + 38);
      const pitch = THREE.MathUtils.degToRad(camera.pitch);
      const distance = span * 1.72 * narrowFit / camera.zoom;
      state.camera.position.set(
        target.x + Math.sin(theta) * Math.cos(pitch) * distance,
        target.y + Math.sin(pitch) * distance,
        target.z + Math.cos(theta) * Math.cos(pitch) * distance,
      );
      state.camera.up.set(0, 1, 0);
      state.camera.lookAt(target);
    }
    state.camera.updateProjectionMatrix();
  }, [camera, project.room]);

  const raycast = (clientX: number, clientY: number, targets: THREE.Object3D[]) => {
    const state = sceneRef.current;
    const host = stageRef.current;
    if (!state || !host) return [];
    const rect = host.getBoundingClientRect();
    const pointer = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, state.camera);
    return raycaster.intersectObjects(targets, true);
  };

  const floorPoint = (clientX: number, clientY: number) => raycast(clientX, clientY, sceneRef.current ? [sceneRef.current.floor] : [])[0]?.point;

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = sceneRef.current;
    if (!state) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const hits = raycast(event.clientX, event.clientY, [...state.objectGroups.values()]);
    let hit: THREE.Object3D | null = hits[0]?.object ?? null;
    while (hit && !hit.userData.placementId) hit = hit.parent;
    const id = hit?.userData.placementId as string | undefined;
    if (id && event.button === 0) {
      select(id);
      const group = state.objectGroups.get(id);
      const point = floorPoint(event.clientX, event.clientY);
      if (!group || group.userData.locked || !point) return;
      dragRef.current = { kind: "object", id, offsetX: group.position.x - point.x, offsetZ: group.position.z - point.z, lastX: group.position.x, lastZ: group.position.z };
      return;
    }
    select(null);
    dragRef.current = { kind: "camera", startX: event.clientX, startY: event.clientY, button: event.button };
  };

  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const state = sceneRef.current;
    if (!drag || !state) return;
    if (drag.kind === "object") {
      const point = floorPoint(event.clientX, event.clientY);
      const group = state.objectGroups.get(drag.id);
      const placement = projectRef.current.placements.find((item) => item.id === drag.id);
      const asset = placement ? furnitureAssets.find((item) => item.id === placement.assetId) : null;
      if (!point || !group || !asset) return;
      const halfWidth = asset.width / 2;
      const halfDepth = asset.depth / 2;
      const nextX = Math.max(-halfWidth, Math.min(projectRef.current.room.width + halfWidth, point.x + drag.offsetX + projectRef.current.room.width / 2));
      const nextZ = Math.max(-halfDepth, Math.min(projectRef.current.room.length + halfDepth, point.z + drag.offsetZ + projectRef.current.room.length / 2));
      group.position.set(nextX - projectRef.current.room.width / 2, 0, nextZ - projectRef.current.room.length / 2);
      if (state.selection) state.selection.update();
      drag.lastX = nextX;
      drag.lastZ = nextZ;
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const current = cameraRef.current;
    if (drag.button === 2 || event.shiftKey) setCamera({ ...current, panX: current.panX + dx, panY: current.panY + dy });
    else setCamera({ ...current, yaw: current.yaw + dx * 0.35, pitch: Math.max(24, Math.min(78, current.pitch + dy * 0.22)), mode: "orbit" });
    drag.startX = event.clientX;
    drag.startY = event.clientY;
  };

  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.kind === "object") onMoveRef.current(drag.id, Number(drag.lastX.toFixed(2)), Number(drag.lastZ.toFixed(2)));
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const zoom = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const current = cameraRef.current;
    setCamera({ ...current, zoom: Math.max(0.58, Math.min(1.75, current.zoom - event.deltaY * 0.001)) });
  };

  return (
    <div className="room-canvas three-room-stage" ref={stageRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={zoom} onContextMenu={(event) => event.preventDefault()}>
      <div className="canvas-hint"><span>ลากเฟอร์นิเจอร์ให้ตามเมาส์</span><span>ลากพื้นเพื่อหมุนห้อง</span><span>⇧ + ลาก เพื่อเลื่อน</span><span>Scroll เพื่อซูม</span></div>
      <div className="north-mark">N</div>
      <div className="model-status"><i /> {modelsLoading ? `กำลังโหลด ${modelsLoading} โมเดล` : "24 FBX · READY"}</div>
      {!project.placements.length && <div className="canvas-empty"><span>＋</span><h3>ห้องพร้อมแล้ว</h3><p>เลือกเฟอร์นิเจอร์จากคลังเพื่อเริ่มจัดวาง</p></div>}
      <div className="axis-widget"><i className="axis-y" /><i className="axis-x" /><span>Y</span><b>X</b></div>
    </div>
  );
}
