import { useMemo } from "react";
import { Position, Handle, type NodeProps, type Node } from "@xyflow/react";
import ShaderNode from "@/app/shaders/ShaderNode";
import { useUVParamsStore } from "@/components/flow/uv-params-store";
import {
  getUVNodeKind,
  getDefaultParams,
  DEFAULT_UV_KIND_ID,
} from "@/components/flow/uv-shader-kinds";

export type UVNodeData = { label?: string; kind?: string };
export type UVNodeType = Node<UVNodeData, "uvNode">;

function UVNode({ id, data }: NodeProps<UVNodeType>) {
  const kindId = data.kind ?? DEFAULT_UV_KIND_ID;
  const kind = getUVNodeKind(kindId);
  const defaults = useMemo(() => getDefaultParams(kind), [kind]);

  const { getParams, selectNode } = useUVParamsStore();
  const params = getParams(id, defaults);

  return (
    <div
      className="rounded-md bg-gray-200 
    dark:bg-[#3b3b3b57] "
      onClick={() => selectNode(id, kindId)}>
      <Handle
        type="target"
        position={Position.Right}
        id="source-UV-1"
        aria-label="output"
        style={{
          top: "25%",
          background: "none",
          border: "1pt solid #fff",
          width: ".7em",
          height: ".7em",
          zIndex: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="target-UV-1"
        style={{
          background: "none",
          border: "1pt solid #fff",
          width: ".7em",
          height: ".7em",
          zIndex: 10,
        }}
      />

      <div>
        <label
          htmlFor="text"
          className="px-4 text-[8pt] text-gray-600 dark:text-white">
          {kind.label}
        </label>
        <div className="w-full h-0.5 bg-[#d3d3d357] dark:bg-[#5f5f5f57] mt-1"></div>
        <div className="w-40 h-40">
          <ShaderNode fragmentShader={kind.fragmentShader} params={params} />
        </div>
      </div>
    </div>
  );
}

export default UVNode;
