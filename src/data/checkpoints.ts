export const checkpoints = [
  { position: [2, 2, 5], rotation: [0, 0, 0], name: "Front" },
  { position: [-2, 2, 5], rotation: [0, Math.PI, 0], name: "Back" },
  { position: [0, 3, 0], rotation: [-Math.PI / 2, 0, 0], name: "Top" },
  { position: [0, -3, 0], rotation: [Math.PI / 2, 0, 0], name: "Bottom" },
] as const;
