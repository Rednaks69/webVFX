import Flow from "@/components/flow/Flow";
import React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Home = () => {
  return (
    <section className="ww-[calc(100vw-5px)] h-[calc(100vh-70px)] px-4">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 w-full h-full rounded-lg border">
        <ResizablePanel defaultSize="15%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">One</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical" className="h-full">
            <ResizablePanel defaultSize="50%">
              <div className="h-full p-2">
                <Flow />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="10%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Three</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
};

export default Home;
