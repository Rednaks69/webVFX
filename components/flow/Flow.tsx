"use client";

import { useState, useCallback } from "react";
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

const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 400, y: 400 },
    data: { label: "Node 1" },
    type: "input",
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
    data: { value: "Node 2" },
  },
];

// Both your existing custom node and the new erasable one,
// registered side by side — nothing about TextUpdaterNode changes.
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
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isEraserActive, setIsEraserActive] = useState(false);

  // console.log(inPixels);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
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
    [],
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
