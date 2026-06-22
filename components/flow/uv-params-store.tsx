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

const UVParamsContext = createContext<StoreState | null>(null);

export function UVParamsProvider({ children }: { children: ReactNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedKindId, setSelectedKindId] = useState<string | null>(null);
  const [paramsById, setParamsById] = useState<Record<string, ParamsMap>>({});

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
