import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  controls?: OrbitControls,
  offset = 1.25,
  meshCenterRef?: React.MutableRefObject<THREE.Vector3 | null>
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  if (meshCenterRef) {
    meshCenterRef.current = center.clone();
  }

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  cameraZ *= offset;

  camera.position.set(center.x, center.y, cameraZ + center.z);
  camera.lookAt(center);

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }

  camera.near = maxDim / 100;
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
}

export function createCheckpoints(center: THREE.Vector3, distance: number) {
  return [
    {
      name: "Front",
      position: [center.x, center.y, center.z + distance],
      target: [center.x, center.y, center.z],
    },
    {
      name: "Right",
      position: [center.x + distance, center.y, center.z],
      target: [center.x, center.y, center.z],
    },
    {
      name: "Top",
      position: [center.x, center.y + distance, center.z],
      target: [center.x, center.y, center.z],
    },
    {
      name: "Left",
      position: [center.x - distance, center.y, center.z],
      target: [center.x, center.y, center.z],
    },
  ];
}
