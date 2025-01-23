import type { Edge, EdgeTypes } from "@xyflow/react";
import { DefaultEdge } from "./default-edge";

export const defaultInitialEdges: Edge[] = [];

export const edgeTypes = {
  // Add your custom edge types here!
  default: DefaultEdge,
} satisfies EdgeTypes;
