import { useCallback } from "react";
import { Position, Handle } from "@xyflow/react";

function TextUpdaterNode() {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div
      className="rounded-md bg-gray-200 px-1  
    dark:bg-[#3b3b3b57] ">
      <Handle type="target" position={Position.Right} id="target-text-1" />
      <Handle type="source" position={Position.Left} id="source-text-1" />

      <div>
        <label
          htmlFor="text"
          className="px-2 text-[8pt] text-gray-600 dark:text-white">
          Text:
        </label>
        <div className="w-full h-0.5 bg-[#d3d3d357] dark:bg-[#5f5f5f57] mb-1"></div>
        <input
          id="text"
          name="text"
          onChange={onChange}
          className="nodrag w-full rounded-md 
          border border-gray-300 bg-white p-2 text-xs text-gray-900 
          dark:border-gray-600 dark:bg-gray-200 dark:text-black mb-1.5"
        />
      </div>
    </div>
  );
}

export default TextUpdaterNode;
