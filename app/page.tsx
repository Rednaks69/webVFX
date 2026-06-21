"use client";

import Flow from "@/components/flow/Flow";
import React, { useRef, useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import MainRenderer from "@/components/renders/MainRenderer";

const Home = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null);

  return (
    <section className="ww-[calc(100vw-5px)] h-[calc(100vh-70px)] px-4">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 w-full h-full rounded-lg border">
        <ResizablePanel defaultSize="30%">
          <div
            ref={leftPanelRef}
            className="flex h-full items-center justify-center p-6">
            <MainRenderer />
          </div>
        </ResizablePanel>
        {/* / / / / /  two */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical" className="h-full">
            <ResizablePanel>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="h-full p-2">
                    <Flow />
                  </div>
                </ContextMenuTrigger>

                {/*  */}

                <ContextMenuContent>
                  {/* <ContextMenuItem>More Tools</ContextMenuItem> */}
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuGroup>
                        <ContextMenuItem>Save Page...</ContextMenuItem>
                        <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                        <ContextMenuItem>Name Window...</ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        <ContextMenuItem>Developer Tools</ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        <ContextMenuItem variant="destructive">
                          Delete
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  {/*  */}
                </ContextMenuContent>

                {/*  */}
              </ContextMenu>
            </ResizablePanel>
            {/* / / / / /  two end*/}
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
