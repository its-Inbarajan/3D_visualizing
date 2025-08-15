"use client";
import React, { ReactNode } from "react";

type CheckpointContextType = {
  currentIndex: number;
  next: () => void;
  prev: () => void;
};

const CheckpointContext = React.createContext<CheckpointContextType | null>(
  null
);

export function CheckpointProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % 4);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + 4) % 4);

  return (
    <CheckpointContext.Provider value={{ currentIndex, next, prev }}>
      {children}
    </CheckpointContext.Provider>
  );
}

export function useCheckpoint() {
  const context = React.useContext(CheckpointContext);
  if (!context)
    throw new Error("useCheckpoint must be used within CheckpointProvider");
  return context;
}
