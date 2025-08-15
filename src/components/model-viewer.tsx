"use client";

import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import * as THREE from "three";
import { checkpoints } from "@/data/checkpoints";
import { gsap } from "gsap";
import { useCheckpoint } from "@/context/CheckpointContext";
function Model({ url }: { url: string }) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    const loader = new PLYLoader();
    loader.load(url, (geometry) => {
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current?.add(mesh);
    });
  }, [url]);

  return <group ref={meshRef}></group>;
}

function CameraController() {
  const { camera } = useThree();
  const { currentIndex } = useCheckpoint();

  React.useEffect(() => {
    const checkpoint = checkpoints[currentIndex];
    gsap.to(camera.position, {
      x: checkpoint.position[0],
      y: checkpoint.position[1],
      z: checkpoint.position[2],
      duration: 1,
    });
  }, [currentIndex, camera]);

  return null;
}

export const ModelViewer = () => {
  return (
    <Canvas className="w-full h-full bg-black">
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.3} />
      <PerspectiveCamera makeDefault position={[2, 2, 5]} />
      <Model url="/models/Patchwork chair.ply" />
      <OrbitControls />
      <CameraController />
    </Canvas>
  );
};
