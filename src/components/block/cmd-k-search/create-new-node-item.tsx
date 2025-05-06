import { CommandItem } from "@/components/ui/command";
import { Loader2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreateNewNodeItemProps {
  searchQuery: string;
  onSelect: () => void;
  isCreating: boolean;
}

export function CreateNewNodeItem({
  searchQuery,
  onSelect,
  isCreating,
}: CreateNewNodeItemProps) {
  const canCreate = searchQuery.trim().length > 0;

  return (
    <CommandItem
      className={cn(
        "cursor-pointer py-2",
        !canCreate && "opacity-50 cursor-not-allowed"
      )}
      onSelect={canCreate && !isCreating ? onSelect : undefined}
      disabled={isCreating || !canCreate}
    >
      {isCreating ? (
        <Loader2 className="w-4 h-4 mr-3 flex-shrink-0 animate-spin" />
      ) : (
        <PlusCircle className="w-4 h-4 mr-3 flex-shrink-0" />
      )}
      <div className={cn(!canCreate && "text-muted-foreground")}>
        「
        <span
          className={cn("mx-[2px] font-semibold", canCreate && "text-accent")}
        >
          {searchQuery || "..."}
        </span>
        」を新しく作る
      </div>
    </CommandItem>
  );
}
