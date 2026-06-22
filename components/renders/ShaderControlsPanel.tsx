"use client";

import { useUVParamsStore } from "@/components/flow/uv-params-store";
import { getUVNodeKind, getDefaultParams } from "@/components/flow/uv-shader-kinds";

export default function ShaderControlsPanel() {
  const { selectedNodeId, selectedKindId, getParams, setParams } =
    useUVParamsStore();

  if (!selectedNodeId || !selectedKindId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <span className="text-xs text-center text-gray-500">
          Select a UV node to edit its shader
        </span>
      </div>
    );
  }

  const kind = getUVNodeKind(selectedKindId);
  const defaults = getDefaultParams(kind);
  const params = getParams(selectedNodeId, defaults);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 overflow-auto">
      <span className="font-semibold text-sm">{kind.label}</span>

      {kind.params.map((p) => (
        <label key={p.key} className="flex flex-col gap-1 text-xs">
          <span>
            {p.label}: {(params[p.key] ?? p.defaultValue).toFixed(2)}
          </span>
          <input
            className="nodrag"
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={params[p.key] ?? p.defaultValue}
            onChange={(e) =>
              setParams(selectedNodeId, { [p.key]: parseFloat(e.target.value) })
            }
          />
        </label>
      ))}
    </div>
  );
}
