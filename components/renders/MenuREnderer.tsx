// components/renders/MenuREnderer.tsx
"use client";

import { Button } from "../ui/button";
import { useRenderMode, type RenderMode } from "./render-mode-store";

const MODES: { label: string; value: RenderMode }[] = [
  { label: "2D", value: "2d" },
  { label: "3D", value: "3d" },
  { label: "2D->3D", value: "2d-to-3d" },
  { label: "Auto", value: "auto" },
];

const MenuRenderer = () => {
  const { mode, setMode } = useRenderMode();

  return (
    <div
      className="flex items-center justify-around bg-gray-50 dark:bg-[#3b3b3b40]
    gap-0.5 border border-gray-400 dark:border-gray-600 p-2 rounded-2xl">
      {MODES.map(({ label, value }) => (
        <Button
          key={value}
          onClick={() => setMode(value)}
          aria-pressed={mode === value}
          className="bg-gray-50 dark:bg-[#3b3b3b10] text-gray-600 dark:text-white 
        rounded-md hover:bg-accent hover:text-black dark:hover:bg-[#3b3b3b40] 
        focus:bg-fuchsia-500 focus:text-white dark:focus:bg-fuchsia-500 dark:focus:border
        aria-pressed:bg-fuchsia-500 aria-pressed:text-white">
          {label}
        </Button>
      ))}
    </div>
  );
};

export default MenuRenderer;
