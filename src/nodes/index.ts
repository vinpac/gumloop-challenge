import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { z } from "zod";
import { RootNode } from "@/components/root-node";
import { zField } from "@/components/zod-form/helpers";

export const defaultInitialNodes: AppNode[] = [
  {
    id: "a",
    type: "file-input",
    position: { x: 0, y: 0 },
    data: {
      label: "Upload a PDF",
    },
  },
  {
    id: "b",
    type: "llm",
    position: { x: 0, y: 72 },
    data: {
      prompt: "Write your promp here",
      model: "gpt-4o",
    },
  },
  {
    id: "c",
    type: "llm",
    position: { x: 0, y: 128 },
    data: {
      prompt: "What is the meaning of life?",
      model: "gpt-4o",
    },
  },
];

type NodeDefinition = {
  id: AppNode["type"];
  name: string;
  description: string;
  input: z.ZodObject<any, any, any, any>;
};

export type NodeDefinitionId = NodeDefinition["id"];

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    id: "file-input",
    name: "PDF",
    description: "Upload a PDF",
    input: z.object({
      label: z.string(),
    }),
  },
  {
    id: "llm",
    name: "LLM",
    input: z.object({
      prompt: zField(z.string(), {
        label: "Prompt",
        placeholder: "Write your prompt here",
        minRows: 4,
      }),
      model: zField(z.enum(["gpt-4o", "gpt-4o-mini"]), {
        label: "Model",
        placeholder: "Select a model to run",
      }),
    }),
    description:
      "Use an open AI model to generate text. It receives the previous node's output.",
  },
];

export const nodeTypes = Object.fromEntries(
  NODE_DEFINITIONS.map((nodeDefinition) => [
    nodeDefinition.id as AppNode["id"],
    RootNode,
  ])

  // forcing the type here to route all nodes to RootNode since I only have task nodes with the same format (header + form)
) as unknown as NodeTypes;
