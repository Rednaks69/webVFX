// components/renders/render-mode-store.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type RenderMode = "2d" | "3d" | "2d-to-3d" | "auto";

type RenderModeContextValue = {
  mode: RenderMode;
  setMode: (mode: RenderMode) => void;
};

const RenderModeContext = createContext<RenderModeContextValue | null>(null);

export function RenderModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<RenderMode>("2d");

  return (
    <RenderModeContext.Provider value={{ mode, setMode }}>
      {children}
    </RenderModeContext.Provider>
  );
}

export function useRenderMode() {
  const ctx = useContext(RenderModeContext);
  if (!ctx) {
    throw new Error("useRenderMode must be used within a RenderModeProvider");
  }
  return ctx;
}
