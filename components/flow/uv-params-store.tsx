"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
// NEW: we need React Flow's types now, since this store is about to hold
// the actual graph (nodes + edges), not just per-node param values.
import type { Node, Edge } from "@xyflow/react";

export type ParamsMap = Record<string, number>;

type StoreState = {
  selectedNodeId: string | null;
  selectedKindId: string | null;
  selectNode: (id: string, kindId: string) => void;
  clearSelection: () => void;
  getParams: (id: string, defaults: ParamsMap) => ParamsMap;
  setParams: (id: string, params: ParamsMap) => void;
  outputNodeId: string | null;
  outputKindId: string | null;
  setOutputNode: (id: string, kindId: string) => void;
  clearOutputNode: () => void;

  // ---------------------------------------------------------------------
  // NEW: the graph itself. Flow.tsx is the "writer" (it owns the canvas
  // interactions — dragging, connecting, deleting). ShaderCanvas is a
  // "reader" — it needs to see the same nodes/edges to walk the graph in
  // compose-shader.ts. Putting them here means neither side has to thread
  // props down through unrelated components.
  // ---------------------------------------------------------------------
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

const UVParamsContext = createContext<StoreState | null>(null);

export function UVParamsProvider({ children }: { children: ReactNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedKindId, setSelectedKindId] = useState<string | null>(null);
  const [paramsById, setParamsById] = useState<Record<string, ParamsMap>>({});
  const [outputNodeId, setOutputNodeId] = useState<string | null>(null);
  const [outputKindId, setOutputKindId] = useState<string | null>(null);

  // NEW: the graph state, moved here from Flow.tsx's local useState.
  // Starts empty — Flow.tsx will seed it with the same initialNodes/
  // initialEdges it used before, via a useEffect or by just initializing
  // useState's initial value through a prop. We'll do the simplest thing:
  // Flow.tsx keeps owning the *initial* data, but the *state* itself lives
  // here so ShaderCanvas can read it too.
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const selectNode = useCallback((id: string, kindId: string) => {
    setSelectedNodeId(id);
    setSelectedKindId(kindId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedKindId(null);
  }, []);

  const getParams = useCallback(
    (id: string, defaults: ParamsMap) => ({ ...defaults, ...paramsById[id] }),
    [paramsById],
  );

  const setParams = useCallback((id: string, params: ParamsMap) => {
    setParamsById((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...params },
    }));
  }, []);

  const setOutputNode = useCallback((id: string, kindId: string) => {
    setOutputNodeId(id);
    setOutputKindId(kindId);
  }, []);

  const clearOutputNode = useCallback(() => {
    setOutputNodeId(null);
    setOutputKindId(null);
  }, []);

  return (
    <UVParamsContext.Provider
      value={{
        selectedNodeId,
        selectedKindId,
        selectNode,
        clearSelection,
        getParams,
        setParams,
        outputNodeId,
        outputKindId,
        setOutputNode,
        clearOutputNode,
        // NEW: expose the graph + its setters.
        nodes,
        edges,
        setNodes,
        setEdges,
      }}>
      {children}
    </UVParamsContext.Provider>
  );
}

export function useUVParamsStore() {
  const ctx = useContext(UVParamsContext);
  if (!ctx) {
    throw new Error("useUVParamsStore must be used within UVParamsProvider");
  }
  return ctx;
}
