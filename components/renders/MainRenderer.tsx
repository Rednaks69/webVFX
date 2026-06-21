import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import MenuRenderer from "./MenuREnderer";
import Renderer from "./Renderer";

const MainRenderer = () => {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="flex-1 w-full h-full rounded-lg no-scrollbar">
      <ResizablePanel defaultSize="80%">
        <div className="flex h-full flex-col gap-8">
          <div className="w-full ">
            <MenuRenderer />
          </div>
          <div className="">
            <Renderer />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="20%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">AI section</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default MainRenderer;
