import type { Node, BuiltInNode } from "@xyflow/react";

export type FileInputNode = Node<
  {
    label: string;
    file?: NodeFile;
  },
  "file-input"
>;

type NodeFile = {
  name: string;
  size: number;
  type: string;
  content: string;
};

export type LLMNode = Node<
  {
    prompt: string;
    model: string;
  },
  "llm"
>;

export type AppNode = BuiltInNode | FileInputNode | LLMNode;

export type NodeExecutionState = {
  isRunning: boolean;
  output?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type NodeExecutionStore = Record<string, NodeExecutionState>;
