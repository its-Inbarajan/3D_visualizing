import Controls from "@/components/controls";
import { ModelViewer } from "@/components/model-viewer";
// import dynamic from "next/dynamic";

// const ModelViewer = dynamic(
//   () => import("@/components/model-viewer").then((mod) => mod.ModelViewer),
//   {
//     ssr: false,
//   }
// );

export default function Home() {
  return (
    <div className="relative w-screen h-screen">
      <ModelViewer />
      <Controls />
    </div>
  );
}
