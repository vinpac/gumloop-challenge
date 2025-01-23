import { useNodeExecutionStore } from "@/stores/node-execution-store";
import { AppNode, FileInputNode } from "@/nodes/types";
import { useReactFlow } from "@xyflow/react";

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

async function getNodeInputs(calls: NodeCall[]) {
  return calls.map((call) => call.output).join("\n");
}

export function RunButton({ onRun }: RunButtonProps) {
  const { getNodes, getEdges } = useReactFlow();
  const { setNodeState, clearAllStates } = useNodeExecutionStore();

  const runFlow = async () => {
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

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let output = "";

        // Get inputs from received calls if any
        const nodeState = callStack.get(nodeId);
        const inputs = nodeState
          ? await getNodeInputs(nodeState.receivedCalls)
          : "";

        // dispatch node workflow
        if (node.type === "file-input") {
          if (!node.data.file) {
            throw new Error("File is required");
          }

          output =
            (node.data.file as FileInputNode["data"]["file"])?.content || "";
        } else if (node.type === "llm" && node.data.prompt) {
          // Here you would make the actual API call to ChatGPT
          // For now, we'll simulate it
          output = `Simulated LLM response for prompt: ${node.data.prompt}\nWith inputs: ${inputs}`;
        }

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
