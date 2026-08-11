"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { furnitureAssets } from "@/data/catalog";
import type { FurnitureAsset } from "@/types/fursign";

const previewItems = [
  { assetId: "sofa-3", x: 1.35, z: 3.65, rotation: 0 },
  { assetId: "sofa-love", x: 3.65, z: 3.35, rotation: 270 },
  { assetId: "table-coffee", x: 2.55, z: 2.65, rotation: 0 },
  { assetId: "plant-large", x: .55, z: .65, rotation: 0 },
  { assetId: "lamp-floor", x: 4.45, z: .7, rotation: 0 },
];

function fitPreviewModel(source: THREE.Group, asset: FurnitureAsset) {
  const model = source.clone(true);
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry = child.geometry.clone();
    child.material = Array.isArray(child.material) ? child.material.map((material) => material.clone()) : child.material.clone();
    child.castShadow = true;
    child.receiveShadow = true;
  });
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  model.scale.set(asset.width / Math.max(size.x, .001), asset.height / Math.max(size.y, .001), asset.depth / Math.max(size.z, .001));
  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -fitted.min.y, -center.z);
  return model;
}

export default function MiniRoomPreview() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f4ec);
    const camera = new THREE.OrthographicCamera(-4.2, 4.2, 3.2, -3.2, .1, 50);
    camera.position.set(7, 7.2, 8);
    camera.lookAt(0, .5, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "ผลลัพธ์ห้องสามมิติจาก AI พรอมต์");
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfffbef, 0x6c756e, 2.7));
    const light = new THREE.DirectionalLight(0xffead1, 2.6);
    light.position.set(4, 8, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(5, .12, 5), new THREE.MeshStandardMaterial({ color: 0xd6b187, roughness: .9 }));
    floor.position.y = -.06;
    floor.receiveShadow = true;
    scene.add(floor);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf0ede5, roughness: .86 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(5.12, 2.7, .1), wallMaterial.clone());
    back.position.set(0, 1.35, -2.5);
    const side = new THREE.Mesh(new THREE.BoxGeometry(.1, 2.7, 5.12), wallMaterial.clone());
    side.position.set(-2.5, 1.35, 0);
    scene.add(back, side);

    const gridPoints: THREE.Vector3[] = [];
    for (let value = -2.5; value <= 2.5; value += .5) {
      gridPoints.push(new THREE.Vector3(value, .012, -2.5), new THREE.Vector3(value, .012, 2.5));
      gridPoints.push(new THREE.Vector3(-2.5, .012, value), new THREE.Vector3(2.5, .012, value));
    }
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPoints), new THREE.LineBasicMaterial({ color: 0x9f8264, transparent: true, opacity: .22 })));

    const loader = new FBXLoader();
    previewItems.forEach(({ assetId, x, z, rotation }) => {
      const asset = furnitureAssets.find((item) => item.id === assetId);
      if (!asset?.modelUrl) return;
      loader.load(asset.modelUrl, (source) => {
        if (!host.isConnected) return;
        const group = new THREE.Group();
        group.add(fitPreviewModel(source, asset));
        group.position.set(x - 2.5, 0, z - 2.5);
        group.rotation.y = THREE.MathUtils.degToRad(-rotation);
        scene.add(group);
        renderer.render(scene, camera);
      });
    });

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const aspect = rect.width / Math.max(rect.height, 1);
      const viewHeight = 6.3;
      camera.left = -(viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return () => {
      observer.disconnect();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="mini-room-3d" ref={hostRef}><span className="ai-result-badge">ผลลัพธ์จาก AI</span><i className="measure-x">5 ม.</i><i className="measure-z">5 ม.</i></div>;
}
