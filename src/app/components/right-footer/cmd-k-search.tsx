import { FileText, Loader2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { getAllNodes } from "@/app/actions/search";
import { useMemo, useState, useTransition } from "react";
import { useEffect } from "react";
import { Node, Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { createNode } from "@/app/actions/node";
import Editor from "@/components/editor";
import { cn } from "@/lib/utils";
import { generateExtensions } from "@/components/editor/extensions";
import { useEditor } from "@tiptap/react";

type CmdKSearchModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function NodePreview({ node }: { node: Node & { tags: Tag[] } }) {
  const editorKey = useMemo(() => node.id, [node.id]);

  const editor = useEditor(
    {
      extensions: generateExtensions(),
      content: node.content,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editable: false,
    },
    [editorKey]
  );

  return <Editor editor={editor} />;
}

function CommandItemWrapper({
  onMouseEnter,
  node,
  onSelect,
}: {
  onMouseEnter: () => void;
  node: Node & { tags: Tag[] };
  onSelect: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSelect = () => {
    startTransition(() => {
      onSelect();
    });
  };

  return (
    <CommandItem
      className="cursor-pointer py-2"
      value={node.id}
      onSelect={handleSelect}
      onMouseEnter={onMouseEnter}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-3 flex-shrink-0 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
      )}

      <div className="flex justify-between w-full">
        <div className="line-clamp-1 flex-1 mr-4">{node.name}</div>
      </div>
    </CommandItem>
  );
}

type CreateNewNodeItemProps = {
  searchQuery: string;
  onSelect: () => void;
};

function CreateNewNodeItem({ searchQuery, onSelect }: CreateNewNodeItemProps) {
  const [isPending, startTransition] = useTransition();
  const handleSelect = () => {
    startTransition(() => {
      onSelect();
    });
  };

  return (
    <CommandItem className="cursor-pointer py-2" onSelect={handleSelect}>
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-3 flex-shrink-0 animate-spin" />
      ) : (
        <PlusCircle className="w-4 h-4 mr-3 flex-shrink-0" />
      )}
      <div className="">
        「<span className="text-accent mx-[2px]">{searchQuery}</span>
        」を新しく作る
      </div>
    </CommandItem>
  );
}

export default function CmdKSearch({ open, setOpen }: CmdKSearchModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allNodes, setAllNodes] = useState<(Node & { tags: Tag[] })[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<
    (Node & { tags: Tag[] })[]
  >([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const nodes = await getAllNodes();
        setAllNodes(nodes);
        setFilteredNodes(nodes);
        setFocusedNodeId(nodes[0].id);
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    };

    fetchNodes();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredNodes(allNodes);
      return;
    }

    const search = () => {
      const results = allNodes.filter((node) => {
        const nameMatch = node.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const tagMatch = node.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return nameMatch || tagMatch;
      });
      setFilteredNodes(results);
    };
    search();
  }, [searchQuery, allNodes, focusedNodeId]);

  const handleCreateNew = async () => {
    try {
      const newNode = await createNode(searchQuery);
      setAllNodes((prev) => [...prev, newNode]);
      router.push(`/node/${newNode.id}`);
      setSearchQuery("");
      setOpen(false);
    } catch (error) {
      console.error("新規作成エラー:", error);
    }
  };

  const handleSelectItem = (node: Node & { tags: Tag[] }) => {
    router.push(`/node/${node.id}`);
    setSearchQuery("");
    setOpen(false);
  };

  const focusedNode =
    filteredNodes.find((node) => node.id === focusedNodeId) || filteredNodes[0];

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="xl:w-[90vw] xl:h-[90vh] xl:max-w-screen-xl w-[500px] h-[500px] p-0">
        <VisuallyHidden.Root>
          <DialogTitle>CmdKSearch</DialogTitle>
        </VisuallyHidden.Root>
        <Command
          shouldFilter={false}
          value={focusedNodeId || undefined}
          onValueChange={(value) => {
            setFocusedNodeId(value);
          }}
          className="h-full"
        >
          <div className="relative h-full flex flex-col">
            <div className="absolute z-10 bg-inherit w-full border-b">
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
            <div className="flex flex-1 h-full z-0 pt-[58px]">
              <CommandList className="overflow-y-auto w-full border-none flex-1 h-full max-h-full">
                <CommandGroup className="p-2 text-sm h-full">
                  {filteredNodes.map((node) => (
                    <CommandItemWrapper
                      key={node.id}
                      node={node}
                      onMouseEnter={() => setFocusedNodeId(node.id)}
                      onSelect={() => handleSelectItem(node)}
                    />
                  ))}
                  {searchQuery.length > 0 && session && (
                    <CreateNewNodeItem
                      searchQuery={searchQuery}
                      onSelect={handleCreateNew}
                    />
                  )}
                </CommandGroup>
              </CommandList>
              <div
                className={cn(
                  focusedNode && "xl:block",
                  "hidden border-l p-4 w-[800px] h-full overflow-y-auto"
                )}
              >
                {focusedNode && <NodePreview node={focusedNode} />}
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
