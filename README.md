**3D Model Viewer (PLY & SPLAT)**

**Live demo** 
[Link](3d-model-visualizing.vercel.app)

A web app built with Next.js, Three.js, and gsplat to view 3D models in both PLY and SPLAT formats.
Supports camera checkpoints, interactive orbit controls, and loading animations.

✨ Features

    - Display PLY models (e.g., patchwork_chair.ply).

    - Display SPLAT models (e.g., dino_30k_cropped.splat).

    - Toggle between PLY and SPLAT modes.

    - Orbit controls: drag, zoom, rotate freely.

    - Checkpoints: predefined camera orientations.

        - Navigate using Prev / Next buttons.

        - Click checkpoint names to jump directly.

    - Shows loading spinner + load time while models load.

    - Reset button to return to the default orientation.

🛠️ Tech Stack

    - Next.js (App Router) – React framework

    - Three.js – Rendering PLY models

    - gsplat – Rendering SPLAT models

    - GSAP – Smooth camera animations

    - OrbitControls – Rotate, zoom, pan interaction

📂 Project Structure

src/
├─ app/
│ └─ page.tsx # Main entry point
├─ components/
│ └─ threeD-viewer.tsx # 3D viewer component
├─ utils/
│ └─ helper.ts # fitCameraToObject & createCheckpoints
public/
└─ models/
├─ patchwork chair.ply
└─ dino_30k_cropped.splat

🚀 Getting Started

**1. Clone repo**
git clone https://github.com/its-Inbarajan/3D_visualizing

cd 3D_visualizing

**2. Install dependencies**

`npm install`

**3.Run dev server**

`npm run dev`

Open http://localhost:3000 in your browser.

**4. Build for production**

`npm run build
 npm run start`

🖱️ Usage

    - Drag with mouse → rotate the model.

    - Scroll → zoom in/out.

    - Switch button → toggle PLY ↔ SPLAT view.

    - Prev / Next → cycle through checkpoints (Front, Right, Top, Left).

    - Checkpoint buttons (top-right) → jump directly to an orientation.

    - Reset → returns to default PLY model at checkpoint 0.

📊 Judging Criteria (How this project meets it)

    - Features implemented - Supports PLY + SPLAT, checkpoints, toggle, rotation, zoom.
    - Model loading latency - Loading spinner + load time display.
    - Ease of use - Simple UI with buttons & direct checkpoint navigation.
    - Optional features - Both formats supported, UI highlights active checkpoint.
