import { DefaultNodeForm } from "@/components/default-node-form";
import { FileInputNodeForm } from "@/components/file-input-node-form";
import { NodeIcon } from "@/components/node-icon";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { AppNode } from "@/nodes/types";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useState } from "react";

const NodeFormTypes = {
  "file-input": FileInputNodeForm,
};

export const RootNode = (node: AppNode) => {
  const { updateNode, setNodes } = useReactFlow();
  const NodeForm = NodeFormTypes[node.type as keyof typeof NodeFormTypes];
  const [label, setLabel] = useState(
    (node.data as { label?: string }).label || node.type
  );
  const syncLabel = useDebounce((newLabel) => {
    updateNode(node.id, { data: { ...node.data, label: newLabel } });
  }, 200);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
  };

  const isRunning = true;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={`bg-white data-[state=open]:ring-2 data-[state=open]:ring-stone-950 data-[state=open]:border-stone-950 w-[280px] cursor-default block rounded-lg border-2 border-stone-300 transition-opacity duration-75 group-[&.dragging_*]/node:!cursor-grabbing ${
          isRunning
            ? "animate-border-path p-0.5 border-0 ring-inset ring-4 ring-green-200"
            : ""
        }`}
      >
        {node.type !== "file-input" && (
          <Handle position={Position.Top} type="target" />
        )}
        <Handle position={Position.Bottom} type="source" />
        <header className="flex items-center cursor-grab gap-1 text-sm font-medium px-2 py-1.5">
          <NodeIcon node={node} className="text-xl" />
          <input
            value={label}
            className="w-full bg-transparent focus:bg-stone-100 focus:outline-none rounded focus:ring-2 px-1.5 focus:ring-stone-100"
            onChange={(e) => {
              setLabel(e.target.value);
              syncLabel(e.target.value);
            }}
          />
        </header>
        {NodeForm && <NodeForm {...node} />}
        {!NodeForm && <DefaultNodeForm {...node} />}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <button className="w-full cursor-pointer" onClick={deleteNode}>
            Delete
          </button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
