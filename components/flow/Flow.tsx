"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TextUpdaterNode from "../CustomNodes/TextUpdaterNode";
import UVNode from "../CustomNodes/UVNode";

import { ErasableNode } from "./ErasableNode";
import { ErasableEdge } from "./ErasableEdge";
import { Eraser } from "./Eraser";
import { Button } from "@/components/ui/button";
import { BiSolidEraser } from "react-icons/bi";

// NEW: pull the graph state from the shared store instead of useState.
import { useUVParamsStore } from "./uv-params-store";

// UNCHANGED: this is still the seed data. It just moves from being a
// useState initializer to something we push into the store once, on mount.
const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 400, y: 400 },
    data: { label: "Node 1" },
    type: "output",
  },
  {
    id: "n2",
    position: { x: 500, y: 500 },
    data: { label: "Node 2" },
  },
  {
    id: "n3",
    type: "textUpdater",
    position: { x: 700, y: 700 },
    data: { value: "Node 2" },
  },
  {
    id: "n4",
    type: "uvNode",
    position: { x: 200, y: 700 },
    data: { kind: "uv-identity" },
  },
  {
    id: "n5",
    type: "uvNode",
    position: { x: 200, y: 900 },
    data: { kind: "uv-transform" },
  },
];

const nodeTypes = {
  textUpdater: TextUpdaterNode,
  "erasable-node": ErasableNode,
  uvNode: UVNode,
};

const edgeTypes = {
  "erasable-edge": ErasableEdge,
};

const initialEdges: Edge[] = [];

//! //////////////////////////////////////////////////////////////

const Flow = () => {
  // CHANGED: nodes/edges no longer come from local useState — they come
  // from the shared store, so ShaderCanvas can read the exact same graph
  // when it composes the preview shader.
  const { nodes, edges, setNodes, setEdges } = useUVParamsStore();

  const [isEraserActive, setIsEraserActive] = useState(false);

  // NEW: seed the store with the initial graph exactly once, on mount.
  // Why an effect and not just useState's initial value? Because the
  // store's useState already ran with an empty array as its initializer
  // (it has no knowledge of Flow's initialNodes/initialEdges — Flow is the
  // one place that owns "what does a fresh canvas start with"). This
  // effect runs once after mount and pushes the seed data in.
  //
  // The empty dependency array is intentional: this should fire exactly
  // once, the same way a useState initializer would have fired exactly
  // once before. If you ever need Flow to remount with fresh seed data,
  // that's a sign this should become a prop/key instead of an effect.
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UNCHANGED below this point — these callbacks already worked purely in
  // terms of "take the previous snapshot, apply changes, set the result."
  // They don't care whether that snapshot's setter came from useState or
  // from a context — the API shape (setNodes(updaterFn)) is identical.

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) =>
        addEdge(
          {
            ...params,
            animated:
              (params.source === "n2" && params.target === "n3") ||
              (params.source === "n3" && params.target === "n2"),
          },
          edgesSnapshot,
        ),
      ),
    [setEdges],
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="text-black"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}>
        <Background gap={60} />
        <Controls className="text-black" />

        {isEraserActive && <Eraser />}

        <Panel position="bottom-center">
          <Button
            size="default"
            className="text-white z-30 p-6"
            variant={isEraserActive ? "default" : "outline"}
            onClick={() => setIsEraserActive((v) => !v)}>
            {isEraserActive ? (
              <div className="flex flex-col items-center justify-center">
                <BiSolidEraser className="text-black" />
                <p className="text-[8pt] text-gray-600 dark:text-white">
                  Eraser{" "}
                  <span className="text-black text-[8pt] font-bold"> ON </span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <BiSolidEraser className="text-yellow-500" />
                <p className="text-[8pt] text-gray-600 dark:text-gray-50">
                  Eraser{" "}
                  <span className="text-yellow-500 text-[8pt] font-bold">
                    {" "}
                    OFF{" "}
                  </span>
                </p>
              </div>
            )}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Flow;

//! //////////////////////////////////////////////////////////////
