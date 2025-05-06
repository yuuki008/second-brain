import { Node, Tag } from "@prisma/client";
import { CommandItem } from "@/components/ui/command";
import { Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CommandItemWrapperProps {
  node: Node & { tags: Tag[] };
  onMouseEnter: () => void;
  onSelect: () => void;
  selectingNodeId: string | null;
}

export function CommandItemWrapper({
  node,
  onMouseEnter,
  onSelect,
  selectingNodeId,
}: CommandItemWrapperProps) {
  const isLoading = selectingNodeId === node.id;
  const disabled = !!selectingNodeId;

  return (
    <CommandItem
      className={cn(
        "cursor-pointer py-2",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      value={node.id}
      onSelect={onSelect}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-3 flex-shrink-0 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
      )}
      <div className="flex justify-between w-full items-center">
        <div className="line-clamp-1 flex-1 mr-4">{node.name}</div>
        <div className="flex gap-1 flex-shrink-0">
          {node.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {node.tags?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{node.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </CommandItem>
  );
}
