import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { AppNode, LLMNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";
import { useApiKeyStore } from "@/stores/api-key-store";
import { streamOpenAIResponse } from "@/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface RunButtonProps {
  onRun: () => void;
}

type NodeCall = {
  nodeId: string;
  sourceId: string;
  output: string;
};

type NodeState = {
  pendingCalls: number;
  receivedCalls: NodeCall[];
};

export function RunButton({ onRun }: RunButtonProps) {
  const { getNodes, getEdges } = useReactFlow();
  const { setNodeState, clearAllStates } = useNodeExecutionStore();
  const openaiKey = useApiKeyStore((state) => state.openaiKey);

  const runFlow = async () => {
    if (!openaiKey) {
      alert("Please set your OpenAI API key first");
      return;
    }

    clearAllStates();
    onRun();

    const edges = getEdges();
    const nodes = getNodes();

    // Initialize call stack state
    const callStack = new Map<string, NodeState>();

    // Count incoming edges for each node
    edges.forEach((edge) => {
      const currentCount = callStack.get(edge.target)?.pendingCalls ?? 0;
      callStack.set(edge.target, {
        pendingCalls: currentCount + 1,
        receivedCalls: [],
      });
    });

    const runNode = async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId) as AppNode | undefined;
      if (!node) return;
      const startedAt = Date.now();

      setNodeState(nodeId, { isRunning: true, startedAt });

      console.info(`[node:${nodeId}] started`);
      try {
        let output = "";

        // Get inputs from received calls if any
        const nodeState = callStack.get(nodeId);
        const inputs = nodeState?.receivedCalls.map((c) => c.output);

        // dispatch node workflow
        if (node.type === "file-input") {
          if (!node.data.file) {
            throw new Error("File is required");
          }
          console.info(`[node:${nodeId}] file input:`, node.data.file);
          output = JSON.stringify(node.data.file) || "";
          console.info(`[node:${nodeId}] file output:`, { output });
        } else if (node.type === "llm") {
          const llmNode = node as LLMNode;
          if (!llmNode.data.prompt) {
            throw new Error("Prompt is required");
          }

          let generated = "";

          const inputMessages: ChatCompletionMessageParam[] =
            inputs?.map((input) => ({
              role: "user",
              content: input as string,
            })) || [];
          const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: llmNode.data.prompt },
            ...inputMessages,
          ];
          console.info(`[node:${nodeId}] llm messages:`, { messages });
          output = await streamOpenAIResponse({
            apiKey: openaiKey,
            model: llmNode.data.model || "gpt-3.5-turbo",
            messages,
            onToken: (token) => {
              generated += token;
              setNodeState(nodeId, {
                isRunning: true,
                output: generated,
                startedAt,
              });
            },
          });
          console.info(`[node:${nodeId}] llm output:`, { output });
        }

        // sleep for 50ms to provide a visual delay for the challenge
        await new Promise((resolve) => setTimeout(resolve, 50));

        setNodeState(nodeId, {
          isRunning: false,
          output,
          startedAt,
          finishedAt: Date.now(),
        });

        // Register this node's output as a call to all target nodes
        const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
        for (const edge of outgoingEdges) {
          const targetState = callStack.get(edge.target);
          if (targetState) {
            targetState.receivedCalls.push({
              nodeId: edge.target,
              sourceId: nodeId,
              output,
            });
            targetState.pendingCalls--;

            // If all inputs are received, run the target node
            if (targetState.pendingCalls === 0) {
              await runNode(edge.target);
            }
          }
        }
      } catch (error) {
        setNodeState(nodeId, {
          isRunning: false,
          error: error instanceof Error ? error.message : "An error occurred",
          startedAt,
          finishedAt: Date.now(),
        });
      }
    };

    // Start with root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    // Run each root node
    for (const node of rootNodes) {
      await runNode(node.id);
    }
  };

  return (
    <button
      onClick={runFlow}
      className="absolute text-lg top-4 right-4 bg-pink-100 hover:bg-pink-200 text-pink-500 font-semibold py-2 px-4 rounded-lg border border-pink-500 transition-colors z-50 flex items-center gap-2"
    >
      Run Flow
    </button>
  );
}
