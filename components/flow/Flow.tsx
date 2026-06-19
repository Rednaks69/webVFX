"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
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
];

const nodeTypes = { textUpdater: TextUpdaterNode };

const initialEdges: Edge[] = [];

//! //////////////////////////////////////////////////////////////

const Flow = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

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
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-[calc(100vw-5px)] h-[calc(100vh-80px)] ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="text-black"
        nodeTypes={nodeTypes}>
        <Background />
        <Controls className="text-black" />
      </ReactFlow>
    </div>
  );
};

export default Flow;
