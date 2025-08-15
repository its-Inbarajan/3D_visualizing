"use client";
import React from "react";

import { useCheckpoint } from "@/context/CheckpointContext";

export default function Controls() {
  const { next, prev } = useCheckpoint();
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
      <button
        onClick={prev}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        Prev
      </button>
      <button
        onClick={next}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  );
}
