import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import MenuRenderer from "./MenuREnderer";

const MainRenderer = () => {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="flex-1 w-full h-full rounded-lg">
      <ResizablePanel defaultSize="70%">
        <div className="flex h-full flex-col gap-8">
          <div className="w-full ">
            <MenuRenderer />
          </div>
          <div className="">
            <p>render</p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="30%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">AI section</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default MainRenderer;
