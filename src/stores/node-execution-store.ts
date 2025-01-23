import { NodeExecutionState, NodeExecutionStore } from "@/nodes/types";
import { create } from "zustand";

interface State {
  nodes: NodeExecutionStore;
  setNodeState: (nodeId: string, state: NodeExecutionState) => void;
  clearAllStates: () => void;
}

export const useNodeExecutionStore = create<State>((set) => ({
  nodes: {},
  setNodeState: (nodeId: string, state: NodeExecutionState) =>
    set((prev) => ({
      nodes: {
        ...prev.nodes,
        [nodeId]: state,
      },
    })),
  clearAllStates: () => set({ nodes: {} }),
}));

export type NodeExecutionStoreState = State;
