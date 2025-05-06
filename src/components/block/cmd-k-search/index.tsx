import React from "react";
import { useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

import { useCmdKSearch } from "./use-cmd-k-search";
import { NodePreview } from "./node-preview";
import { CommandItemWrapper } from "./command-item-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateNewNodeItem } from "./create-new-node-item";

interface CmdKSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CmdKSearch({ open, setOpen }: CmdKSearchProps) {
  const {
    session,
    searchQuery,
    setSearchQuery,
    filteredNodes,
    focusedNodeId,
    setFocusedNodeId,
    focusedNode,
    handleSelectItem,
    isCreating,
    isSelecting,
    isFetchingNodes,
    handleCreateNew,
  } = useCmdKSearch(open, setOpen);

  const handleValueChange = useCallback(
    (value: string) => {
      setFocusedNodeId(value);
    },
    [setFocusedNodeId]
  );

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="xl:h-[90vh] max-w-screen-xl w-[90vw] h-[80vh] p-0 flex flex-col overflow-hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Search or Create Node</DialogTitle>
        </VisuallyHidden.Root>
        <Command
          label="Search or create node command"
          shouldFilter={false} // Filtering is handled by the hook
          // Pass the current focusedNodeId; handle null/undefined carefully
          // Setting value to "" when focusedNodeId is null/empty ensures control
          value={focusedNodeId || ""}
          onValueChange={handleValueChange} // Update focus based on user interaction
          className="flex-1 flex flex-col min-h-0 bg-background" // Ensure background color and flex properties
        >
          {/* Input and Close Button Area */}
          <div className="relative border-b flex items-center">
            <CommandInput
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
              }}
              placeholder="検索または新規作成..."
              className="flex h-14 w-full bg-transparent text-sm placeholder:text-muted-foreground"
              autoFocus={true}
            />
            <Badge
              variant="outline"
              className="absolute right-2 top-1/2 -translate-y-1/2 font-normal"
              onClick={() => setOpen(false)}
            >
              Esc
            </Badge>
          </div>

          {/* Main Content Area: List and Preview */}
          <div className="flex flex-1 min-h-0">
            {/* Command List */}
            <div className="flex-1 overflow-y-auto">
              <CommandList className="max-h-full p-2 border-none">
                <CommandGroup>
                  {isFetchingNodes ? (
                    <>
                      <CommandItem>
                        <Skeleton className="h-8 w-full" />
                      </CommandItem>
                      <CommandItem>
                        <Skeleton className="h-8 w-full" />
                      </CommandItem>
                      <CommandItem>
                        <Skeleton className="h-8 w-full" />
                      </CommandItem>
                    </>
                  ) : filteredNodes.length === 0 ? (
                    searchQuery &&
                    !isCreating && (
                      <div className="p-4 text-sm text-muted-foreground">
                        一致するノードはありません。
                      </div>
                    )
                  ) : (
                    filteredNodes.map((node) => (
                      <CommandItemWrapper
                        key={node.id}
                        node={node}
                        onMouseEnter={() => setFocusedNodeId(node.id)}
                        onSelect={() => handleSelectItem(node.id)}
                        // Pass selecting state only if this specific item is being selected
                        isSelecting={isSelecting && focusedNodeId === node.id}
                      />
                    ))
                  )}

                  {/* Render Create New Item */}
                  {searchQuery.trim().length > 0 && (
                    <CreateNewNodeItem
                      searchQuery={searchQuery}
                      onSelect={handleCreateNew}
                      isCreating={isCreating}
                    />
                  )}
                </CommandGroup>
              </CommandList>
            </div>
            <div
              className={cn(
                "hidden xl:block flex-shrink-0 w-[55%] overflow-y-auto border-l",
                (focusedNode || isFetchingNodes) && "p-4"
              )}
            >
              {isFetchingNodes ? (
                <Skeleton className="h-full w-full" />
              ) : (
                focusedNode && <NodePreview node={focusedNode} />
              )}
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
