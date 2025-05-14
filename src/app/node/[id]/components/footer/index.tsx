import { Separator } from "@/components/ui/separator";
import HintDialog from "./hint-dialog";
import { Node, Tag } from "@prisma/client";
import DeleteNodeDialog from "./delete-node-dialog";
import SwitchVisibility from "./switch-visibility";

interface NodeFooterProps {
  node: Node & { tags: Tag[] };
}

export default function NodeFooter({ node }: NodeFooterProps) {
  return (
    <div className="fixed bottom-2 left-2 z-50 hidden md:block">
      <div className="flex items-center gap-1">
        <DeleteNodeDialog node={node} />
        <Separator orientation="vertical" className="h-4" />
        <HintDialog />
        <Separator orientation="vertical" className="h-4" />
        <SwitchVisibility node={node} />
      </div>
    </div>
  );
}
