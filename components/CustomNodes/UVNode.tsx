// import { useCallback } from "react";
import { Position, Handle } from "@xyflow/react";
import ShaderNode from "@/app/shaders/ShaderNode";

function UVNode() {
  //   const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
  //     console.log(evt.target.value);
  //   }, []);

  return (
    <div
      className="rounded-md bg-gray-200 
    dark:bg-[#3b3b3b57] ">
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
          UV Node
        </label>
        <div className="w-full h-0.5 bg-[#d3d3d357] dark:bg-[#5f5f5f57] mt-1"></div>
        <div className="w-40 h-40">
          <ShaderNode />
        </div>
      </div>
    </div>
  );
}

export default UVNode;
