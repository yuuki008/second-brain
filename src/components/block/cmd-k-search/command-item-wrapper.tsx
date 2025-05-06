import { Node, Tag } from "@prisma/client";
import { CommandItem } from "@/components/ui/command";
import { Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CommandItemWrapperProps {
  node: Node & { tags: Tag[] };
  onMouseEnter: () => void;
  onSelect: () => void; // Callback for selection
  isSelecting: boolean; // Indicates if this item is being selected
}

// CommandItemWrapper receives selection state via props
export function CommandItemWrapper({
  node,
  onMouseEnter,
  onSelect,
  isSelecting,
}: CommandItemWrapperProps) {
  return (
    <CommandItem
      className="cursor-pointer py-2"
      value={node.id} // value is crucial for Command List navigation
      onSelect={onSelect} // Execute the passed selection handler
      onMouseEnter={onMouseEnter}
      // Optionally disable while selecting
      // disabled={isSelecting}
    >
      {isSelecting ? (
        <Loader2 className="w-4 h-4 mr-3 flex-shrink-0 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
      )}
      <div className="flex justify-between w-full items-center">
        <div className="line-clamp-1 flex-1 mr-4">{node.name}</div>
        {/* Optional: Display tags or other info */}
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
