"use client";

import React from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import { createCheckpoints, fitCameraToObject } from "@/utils/helper";
import * as SPLAT from "gsplat";
// Define checkpoints (camera positions and look-at targets)
const checkpoints: {
  position: [number, number, number];
  target: [number, number, number];
  name: string;
}[] = [
  { position: [0, 0, 3], target: [0, 0, 0], name: "Front" }, // Front
  { position: [3, 0, 0], target: [0, 0, 0], name: "Right" }, // Right
  { position: [0, 3, 0], target: [0, 0, 0], name: "Top" }, // Top
  { position: [-3, 0, 0], target: [0, 0, 0], name: "Left" }, // Left
];

export default function ThreeDViewer() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const controlsRef = React.useRef<OrbitControls | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null | SPLAT.Camera>(
    null
  );
  const meshCenterRef = React.useRef<THREE.Vector3 | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const checkpointsRef = React.useRef<unknown[]>([]); // store calculated checkpoints
  const modelCenterRef = React.useRef<THREE.Vector3>(new THREE.Vector3());
  const cameraDistanceRef = React.useRef<number>(3);
  const [mode, setMode] = React.useState<"ply" | "splat">("ply");
  const [loadTime, setLoadTime] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function splatLoader(url: string) {
    if (!mountRef.current) return;
    const scene = new SPLAT.Scene();

    await SPLAT.Loader.LoadAsync(url, scene, () => {});
    // const camerData: SPLAT.CameraData = {
    //   _fx: 45,
    //   _fy: 45,
    //   _width: mountRef.current.clientWidth,
    //   _height: mountRef.current.clientHeight,
    //   _near: 0.1,
    //   _far: 1000,
    //   // _dist: new Float32Array(8),  // Default distortion coefficients
    //   // _type: 0, // Or appropriate camera type
    //   // _fov: 45,
    //   // _aspect: mountRef.current.clientWidth / mountRef.current.clientHeight,
    //   // _projection: 0, // Or appropriate projection type
    //   // _params: {},
    //   // _name: "DefaultCamera",
    //   // _id: "default",
    //   // _model: "",
    //   // _sensor: "",
    //   // _serial: "",
    //   // _timestamp: Date.now(),
    //   // _userData: {},
    // };
    const camera = new SPLAT.Camera();
    cameraRef.current = camera;
    const renderer = new SPLAT.WebGLRenderer();
    const controls = new SPLAT.OrbitControls(camera, renderer.canvas);
    const frame = () => {
      controls.update();
      renderer.render(scene, camera);

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

  React.useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 3.0;
    controlsRef.current = controls;

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xeeeeee, 1);
    scene.add(light);

    // Load PLY model
    let currentObject: THREE.Object3D | null = null;
    const loader = new PLYLoader();
    const startTime = performance.now();

    const loadContext = async () => {
      if (currentObject) {
        scene.remove(currentObject);
        currentObject = null;
      }
      if (mode === "ply") {
        loader.load(
          "/models/patchwork chair.ply",
          (geometry) => {
            const endTime = performance.now();
            setLoadTime(endTime - startTime); // ms
            setLoading(false);
            geometry.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({
              color: 0xcccccc,
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            const box = new THREE.Box3().setFromObject(mesh);
            const center = box.getCenter(new THREE.Vector3());
            modelCenterRef.current = center;

            // Store distance from camera to model center
            cameraDistanceRef.current = camera.position.distanceTo(center);

            // Create dynamic checkpoints
            checkpointsRef.current = createCheckpoints(
              center,
              cameraDistanceRef.current
            );

            fitCameraToObject(camera, mesh, controls);
          },
          (xhr) => {
            if (xhr.total) {
              const percent = (xhr.loaded / xhr.total) * 100;
              console.log(`PLY loading: ${percent.toFixed(1)}%`);
            }
          },
          (err) => {
            console.error("Error loading PLY", err);
            setLoading(false);
          }
        );
      } else if (mode === "splat") {
        await splatLoader("/models/dino_30k_cropped.splat");
      }
    };

    loadContext();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect =
        mountRef.current!.clientWidth / mountRef.current!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current!.clientWidth,
        mountRef.current!.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [mode]);

  // Move camera to checkpoint
  const moveToCheckpoint = (index: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const checkpoint = checkpoints[index];
    const center = meshCenterRef.current || new THREE.Vector3(10, 10, 10);
    setCurrentIndex(index);
    gsap.to(cameraRef.current.position, {
      x: checkpoint.position[0] + center.x,
      y: checkpoint.position[1] + center.x,
      z: checkpoint.position[2] + center.x,
      duration: 1,
      onUpdate: () => {
        controlsRef.current!.target.set(
          checkpoint.target[0] + center.x,
          checkpoint.target[1] + center.y,
          checkpoint.target[2] + center.z
        );
        controlsRef.current!.update();
      },
    });
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % checkpoints.length;
    setCurrentIndex(newIndex);
    moveToCheckpoint(newIndex);
  };

  const handlePrev = () => {
    const newIndex =
      (currentIndex - 1 + checkpoints.length) % checkpoints.length;
    setCurrentIndex(newIndex);
    moveToCheckpoint(newIndex);
  };

  const resetCheckpoint = () => {
    setCurrentIndex(0);
    setMode("ply");
    moveToCheckpoint(0);
  };

  return (
    <div className="relative w-full h-dvh">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/25 text-white text-sm z-20">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
          <span className="ml-5">
            Loading model...
            {loadTime && ` (${(loadTime / 1000).toFixed(2)}s)`}
          </span>
        </div>
      )}
      <button
        onClick={() => setMode(mode === "ply" ? "splat" : "ply")}
        className="absolute top-5 left-5 z-10 py-2 px-3 bg-[#333] text-white border-0 cursor-pointer"
      >
        Switch to {mode === "ply" ? "SPLAT" : "PLY"}
      </button>
      <div ref={mountRef} className="w-full h-full" />
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={handlePrev}
          className="py-2 px-3 bg-[#555] text-white border-0 rounded-lg cursor-pointer"
        >
          Prev
        </button>
        <button
          onClick={resetCheckpoint}
          className="py-2 px-3 bg-[#555] text-white border-0 rounded-lg cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={handleNext}
          className="py-2 px-3 bg-[#555] text-white border-0 rounded-lg cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Checkpoint list */}
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 bg-[rgba(0,0,0,0.4)] p-2.5 rounded-lg">
        {checkpoints.map((cp, index) => (
          <button
            key={cp.name}
            onClick={() => moveToCheckpoint(index)}
            className={`py-1.5 text-white text-sm border-0 cursor-pointer rounded-lg px-4 `}
            style={{
              backgroundColor: index === currentIndex ? "#ff6600" : "#555",
            }}
          >
            {cp.name}
          </button>
        ))}
      </div>
    </div>
  );
}
