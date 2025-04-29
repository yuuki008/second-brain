import { FileText, PlusCircle } from "lucide-react";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { motion, AnimatePresence } from "framer-motion";

import { getAllNodes } from "@/app/actions/search";
import { useState } from "react";
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
  const editor = useEditor({
    extensions: generateExtensions(),
    content: node.content,
    editable: false,
  });
  return <Editor className="overflow-y-auto h-full" editor={editor} />;
}

export default function CmdKSearchModal({
  open,
  setOpen,
}: CmdKSearchModalProps) {
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
  }, [searchQuery, allNodes]);

  // 検索結果をクリックしたときの処理
  const handleSelectItem = (node: Node & { tags: Tag[] }) => {
    router.push(`/node/${node.id}`);
    setSearchQuery("");
    setOpen(false);
  };

  // 何も見つからなかった場合に新規作成
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

  const focusedNode =
    allNodes.find((node) => node.id === focusedNodeId) || allNodes[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-screen h-screen z-[110] bg-background/70 backdrop-blur-sm flex justify-center items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[90vw] h-[90vh]"
            >
              <Command
                value={focusedNodeId || undefined}
                onValueChange={(value) => {
                  console.log(value);
                  setFocusedNodeId(value || null);
                }}
                className="rounded-lg border shadow-lg w-full h-full"
                shouldFilter={false}
              >
                <div className="relative">
                  <CommandInput
                    value={searchQuery}
                    onValueChange={(value) => {
                      setSearchQuery(value);
                    }}
                    placeholder="What are you searching for?"
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
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex h-full border-t">
                        <CommandList className="overflow-y-auto py-1 w-full h-full border-none max-w-[500px] max-h-full">
                          <CommandGroup className="p-2 text-sm">
                            {filteredNodes.map((node) => (
                              <CommandItem
                                key={node.id}
                                onSelect={() => handleSelectItem(node)}
                                className="cursor-pointer py-2"
                                value={node.id}
                              >
                                <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
                                <div className="flex justify-between w-full">
                                  <div className="line-clamp-1 flex-1 mr-4">
                                    {node.name}
                                  </div>
                                  {node.tags && node.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {node.tags.map((tag) => (
                                        <Badge
                                          key={tag.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {tag.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                            {searchQuery.length > 0 && session && (
                              <CommandItem
                                onSelect={handleCreateNew}
                                className="cursor-pointer py-2"
                              >
                                <PlusCircle className="w-4 h-4 mr-3" />
                                <div className="">
                                  Create
                                  <span className="text-accent ml-2">
                                    {searchQuery}
                                  </span>
                                </div>
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                        <div
                          className={cn(
                            focusedNode ? "xl:block" : "hidden",
                            "flex-1 border-l p-2"
                          )}
                        >
                          {focusedNode && <NodePreview node={focusedNode} />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Command>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
