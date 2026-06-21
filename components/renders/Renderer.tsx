import ShaderCanvas from "@/app/shaders/ShaderPlane";
import React from "react";

const Renderer = () => {
  return (
    <div
      className="h-[50vh] w-full border border-gray-50 shadow
       dark:border-[#8f8f8f10] rounded-md no-scrollbar
    bg-gray-50 dark:bg-[#3b3b3b10]">
      <ShaderCanvas />
    </div>
  );
};

export default Renderer;
