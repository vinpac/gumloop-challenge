import type { Edge, EdgeTypes } from "@xyflow/react";
import { DefaultEdge } from "./default-edge";

export const initialEdges: Edge[] = [
  { id: "step1-step2", source: "step1", target: "step2", animated: true },
  { id: "step2-step3", source: "step2", target: "step3", animated: true },
];

export const edgeTypes = {
  // Add your custom edge types here!
  default: DefaultEdge,
} satisfies EdgeTypes;
