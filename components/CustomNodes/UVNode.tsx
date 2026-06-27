import { useMemo, useState } from "react";
import { Position, Handle, type NodeProps, type Node } from "@xyflow/react";
import ShaderNode from "@/app/shaders/ShaderNode";
import { useUVParamsStore } from "@/components/flow/uv-params-store";
import {
  getUVNodeKind,
  getDefaultParams,
  DEFAULT_UV_KIND_ID,
} from "@/components/flow/uv-shader-kinds";
import { Button } from "../ui/button";
// import { Toggle } from "@/components/ui/toggle";

export type UVNodeData = { label?: string; kind?: string };
export type UVNodeType = Node<UVNodeData, "uvNode">;

function UVNode({ id, data }: NodeProps<UVNodeType>) {
  const kindId = data.kind ?? DEFAULT_UV_KIND_ID;
  const kind = getUVNodeKind(kindId);
  const defaults = useMemo(() => getDefaultParams(kind), [kind]);
  const {
    getParams,
    selectNode,
    outputNodeId,
    setOutputNode,
    clearOutputNode,
  } = useUVParamsStore();

  const params = getParams(id, defaults);

  // Active means "this node is currently the one feeding the shared
  // ShaderCanvas preview" — derived from the store instead of local state,
  // so the button reflects reality even if some other node steals output.
  const isActive = outputNodeId === id;

  const bgClass = isActive
    ? "bg-purple-600 dark:bg-purple-800 text-white" // Color after clicking
    : "bg-[#ffffff60] dark:bg-[#d3d3d320] dark:text-gray-200 text-black "; // Your original background color

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
          background: "#c800de",
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
          top: "25%",
          background: "#4a556570",
          width: ".7em",
          height: ".7em",
          zIndex: 10,
        }}
      />

      <div>
        <div
          className="w-[80%] h-px bg-[#d3d3d357] dark:bg-[#5f5f5f57] 
        mb-1 justify-center items-center self-center flex-1 translate-x-5"></div>
        <label
          htmlFor="text"
          className="px-4 text-[12pt] text-gray-600 dark:text-white">
          {kind.label}
        </label>
        <div className="w-full h-0.5 bg-[#d3d3d357] dark:bg-[#5f5f5f57] mt-1"></div>
        <div className="flex justify-between mt-[1.2rem] px-3 dark:text-gray-200">
          <p>In UV</p>
          <Button
            onClick={() =>
              isActive ? clearOutputNode() : setOutputNode(id, kindId)
            }
            className={`${bgClass} -mt-2 rounded-md transition-colors duration-200`}>
            Out UV
          </Button>
        </div>
        <div className="w-40 h-40 sm:ml-3 md:ml-5 lg:ml-6 mt-4 mb-0">
          <ShaderNode fragmentShader={kind.fragmentShader} params={params} />
        </div>
      </div>
    </div>
  );
}

export default UVNode;
