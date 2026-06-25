/****************************************************************************
1- Define the shape of shared data (here: ParamsMap).
2- Define the contract — what can readers see, what can writers do (StoreState).
3- Create the context, typed as Contract | null.
4- Build the provider: real useState for each independent piece of data, 
    useCallback-wrapped functions for any state changes, especially ones that 
    touch more than one piece of state at once or update a nested structure.
5- Bundle it all into the value prop.
6- Write a useX() hook that wraps useContext and throws if it's null.
*****************************************************************************/

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ParamsMap = Record<string, number>;

type StoreState = {
  selectedNodeId: string | null;
  selectedKindId: string | null;
  selectNode: (id: string, kindId: string) => void;
  clearSelection: () => void;
  getParams: (id: string, defaults: ParamsMap) => ParamsMap;
  setParams: (id: string, params: ParamsMap) => void;
};

/**
 * A reader needs to know what's selected (selectedNodeId, selectedKindId) 
 *  and the current values (getParams).
 * A writer needs a way to change the selection (selectNode, clearSelection) 
    and a way to change values (setParams).
 */
const UVParamsContext = createContext<StoreState | null>(null);

// The actual context object. It's StoreState | null because before
// the Provider mounts, there's nothing to give out

export function UVParamsProvider({ children }: { children: ReactNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedKindId, setSelectedKindId] = useState<string | null>(null);
  const [paramsById, setParamsById] = useState<Record<string, ParamsMap>>({});

  /**
   * 
  three independent pieces of state:

  -> selectedNodeId — "which node is active"
  -> selectedKindId — "what kind of node it is" 
      (so the panel knows which param schema to render, 
      without having to go look up the node itself)
  -> paramsById — a dictionary keyed by node id, 
      e.g. { "n4": { uEdge0: 0.6, uEdge1: 0.8 }, "n5": { uRotation: 1.1 } }. 
      Every node gets its own slot, so editing one node's sliders never 
      touches another's. 
  
    */

  const selectNode = useCallback((id: string, kindId: string) => {
    setSelectedNodeId(id);
    setSelectedKindId(kindId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedKindId(null);
  }, []);

  /**
   * bundled state updates — instead of every consumer calling two setters and
   * having to remember to keep them in sync, you give them one verb: "select
   * this node" or "clear the selection.
   */

  const getParams = useCallback(
    (id: string, defaults: ParamsMap) => ({ ...defaults, ...paramsById[id] }),
    [paramsById],
  );

  /**
   * If the user hasn't touched a slider yet, paramsById[id] is undefined,
   *  and spreading undefined is a no-op — so you just get the defaults back.
   *? That's the trick to avoid initializing every node's params up front.
   * */

  const setParams = useCallback((id: string, params: ParamsMap) => {
    setParamsById((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...params },
    }));
  }, []);

  /**
   * 
  -> Spread prev (keep every other node's params untouched).
  -> Overwrite just the [id] key.
        For that key, spread the existing params for that node, 
        then overlay the new ones
  *? example: 
  *? so calling setParams("n4", { uEdge0: 0.9 }) doesn't wipe out uEdge1.
  */

  return (
    <UVParamsContext.Provider
      value={{
        selectedNodeId,
        selectedKindId,
        selectNode,
        clearSelection,
        getParams,
        setParams,
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
