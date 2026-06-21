// import { useCallback } from "react";
import { Position, Handle } from "@xyflow/react";
import ShaderNode from "@/app/shaders/ShaderNode";

function UVNode() {
  //   const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
  //     console.log(evt.target.value);
  //   }, []);

  return (
    <div
      className="rounded-md bg-gray-200 px-1  
    dark:bg-[#3b3b3b57] ">
      <Handle type="target" position={Position.Right} id="source-UV-1" />
      <Handle type="source" position={Position.Left} id="target-UV-1" />

      <div>
        <label
          htmlFor="text"
          className="px-2 text-[8pt] text-gray-600 dark:text-white">
          Text:
        </label>
        <div className="w-full h-0.5 bg-[#d3d3d357] dark:bg-[#5f5f5f57] mb-1"></div>
        <div className="w-50 h-50 pl-6 pt-6">
          <ShaderNode />
        </div>
      </div>
    </div>
  );
}

export default UVNode;
