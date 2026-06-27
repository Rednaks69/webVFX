import { useMemo, useState } from "react";
import { Position, Handle, type NodeProps, type Node } from "@xyflow/react";
import ShaderNode from "@/app/shaders/ShaderNode";
import {
  useUVParamsStore,
  type ParamsMap,
} from "@/components/flow/uv-params-store";
import {
  getUVNodeKind,
  getDefaultParams,
  DEFAULT_UV_KIND_ID,
} from "@/components/flow/uv-shader-kinds";
// NEW: builds this node's standalone preview shader.
import { composeStandaloneShader } from "@/components/flow/compose-shader";
import { Button } from "../ui/button";

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

  // These are the RAW param values, keyed by logical key (e.g. "uRotation"),
  // exactly as before — this part didn't change.
  const params = getParams(id, defaults);

  // NEW: build this node's standalone preview shader. useMemo because the
  // shader TEXT only needs rebuilding when the kind itself changes (e.g.
  // switching dropdown from Identity to Transform), not on every slider
  // drag — same reasoning as everywhere else this pattern shows up.
  const { fragmentShader, uniforms } = useMemo(
    () => composeStandaloneShader(kind, id),
    [kind, id],
  );

  // NEW: composeStandaloneShader's shader expects uniforms named
  // "uRotation_n5", not "uRotation" — so we re-key the raw params object
  // to match before handing it to ShaderNode. ShaderNode itself doesn't
  // change at all; it just iterates whatever keys it's given.
  const shaderParams: ParamsMap = {};
  for (const u of uniforms) {
    shaderParams[u.uniformName] = params[u.key] ?? 0;
  }

  const isActive = outputNodeId === id;

  const bgClass = isActive
    ? "bg-purple-600 dark:bg-purple-800 text-white"
    : "bg-[#ffffff60] dark:bg-[#d3d3d320] dark:text-gray-200 text-black ";

  return (
    <div
      className="rounded-md bg-gray-200 
    dark:bg-[#3b3b3b57] "
      onClick={() => selectNode(id, kindId)}>
      <Handle
        type="source"
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
        type="target"
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
          {/* CHANGED: was kind.fragmentShader/params, now the composed
              standalone shader + re-keyed params */}
          <ShaderNode fragmentShader={fragmentShader} params={shaderParams} />
        </div>
      </div>
    </div>
  );
}

export default UVNode;
