import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { defaultInitialNodes, NodeDefinitionId, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import { RunButton } from "./components/RunButton";
import { RunReportPanel } from "./components/RunReportPanel";
import { Logo } from "./components/Logo";
import { useEvent } from "./hooks/use-event";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "./components/ui/context-menu";
import { NewNodeContextMenuContent } from "./components/new-node-context-menu-content";
import { nanoid } from "nanoid";
import { AppNode } from "@/nodes/types";

function Canvas({ initialNodes }: { initialNodes: AppNode[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const contextMenuElementRef = useRef<HTMLDivElement>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const { screenToFlowPosition } = useReactFlow();
  const handleEdgeClick = useEvent((_: React.MouseEvent, edge: Edge) => {
    setEdges((edges) => edges.filter((e) => e.id !== edge.id));
  });
  const addItem = useEvent((nodeDefId: NodeDefinitionId, name?: string) => {
    const transformText = (
      contextMenuElementRef.current?.parentNode as HTMLElement
    )?.style.transform;
    const [refX, refY] = transformText
      ?.match(/translate\((\d+)px, (\d+)px\)/)
      ?.slice(1, 3)
      .map(Number) || [0, 0];

    setNodes((nodes) => [
      ...nodes,
      {
        id: nanoid(),
        data: {
          label: name,
        },
        type: nodeDefId as AppNode["type"],
        position: screenToFlowPosition({
          x: refX || 0,
          y: refY || 0,
        }),
      } as AppNode,
    ]);
  });

  useEffect(() => {
    // persist nodes to local storage
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  const nodesWithClassNames = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      className: "group/node",
    }));
  }, [nodes]);
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <ReactFlow
          nodes={nodesWithClassNames}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          onEdgeClick={handleEdgeClick}
          snapGrid={[10, 10]}
          panOnScrollSpeed={1.5}
          panOnScroll
        >
          <Background />
          <Logo />
          <RunButton onRun={() => setIsPanelOpen(true)} />
          <RunReportPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        </ReactFlow>
      </ContextMenuTrigger>
      <ContextMenuContent ref={contextMenuElementRef}>
        <NewNodeContextMenuContent onSelect={addItem} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function App() {
  const [initialNodes, setInitialNodes] = useState<AppNode[] | null>(null);

  useEffect(() => {
    const nodes = localStorage.getItem("nodes");
    if (nodes && !initialNodes) {
      setInitialNodes(JSON.parse(nodes));
    } else if (!initialNodes) {
      setInitialNodes(defaultInitialNodes);
    }
  }, [initialNodes]);

  return (
    <ReactFlowProvider>
      {initialNodes && <Canvas initialNodes={initialNodes} />}
    </ReactFlowProvider>
  );
}
