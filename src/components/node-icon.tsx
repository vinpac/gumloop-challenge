import { AppNode } from "@/nodes/types";
import type { IconBaseProps } from "react-icons";
import { TbBrandOpenai, TbFileText } from "react-icons/tb";

const nodeIconMap: Record<string, React.ComponentType<IconBaseProps>> = {
  llm: TbBrandOpenai,
  "file-input": TbFileText,
};

export const NodeIcon = ({
  node,
  ...props
}: {
  node: Pick<AppNode, "type">;
} & IconBaseProps) => {
  const Component = nodeIconMap[node.type as keyof typeof nodeIconMap];

  if (!Component) return null;

  return <Component {...props} />;
};
