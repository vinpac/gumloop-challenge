import type { Node, BuiltInNode } from "@xyflow/react";

export type FileInputNode = Node<
  {
    label: string;
  },
  "file-input"
>;

export type LLMNode = Node<
  {
    prompt: string;
    model: string;
  },
  "llm"
>;

export type AppNode = BuiltInNode | FileInputNode | LLMNode;
