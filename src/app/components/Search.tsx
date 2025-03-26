"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { getAllNodes, createNewNode } from "../actions/search";
import { Node, Tag } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus } from "lucide-react";

const Search: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allNodes, setAllNodes] = useState<(Node & { tags: Tag[] })[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<
    (Node & { tags: Tag[] })[]
  >([]);

  // 初期データの取得
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

  // キーボードショートカットの設定
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 検索クエリが変更されたら検索を実行
  useEffect(() => {
    if (!searchQuery) {
      setFilteredNodes(allNodes);
      return;
    }

    const search = () => {
      const results = allNodes.filter((node) => {
        // 用語名での検索
        const nameMatch = node.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        // タグでの検索
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
    router.push(`/term/${node.id}`);
    setSearchQuery("");
    setOpen(false);
  };

  // 何も見つからなかった場合に新規作成
  const handleCreateNew = async () => {
    try {
      const newNode = await createNewNode(searchQuery);
      // 新規作成した用語をallNodesに追加
      setAllNodes((prev) => [...prev, newNode]);
      router.push(`/node/${newNode.id}`);
      setSearchQuery("");
      setOpen(false);
    } catch (error) {
      console.error("新規作成エラー:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-screen h-screen z-50 bg-background/70 backdrop-blur-sm flex justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-xl w-full mt-[15vh]"
            >
              <Command
                className="rounded-lg border shadow-lg w-full h-auto"
                shouldFilter={false}
              >
                <div className="relative">
                  <CommandInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="What are you searching for?"
                    className="flex h-14 w-full bg-transparent text-sm placeholder:text-muted-foreground"
                    autoFocus={true}
                  />
                  <Badge
                    variant="outline"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
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
                      <CommandList className="overflow-y-auto max-h-96">
                        <CommandGroup className="p-2 text-sm">
                          {filteredNodes.map((node) => (
                            <CommandItem
                              key={node.id}
                              onClick={() => handleSelectItem(node)}
                              onSelect={() => handleSelectItem(node)}
                              className="cursor-pointer py-2"
                            >
                              <FileText className="w-4 h-4 mr-3" />
                              <div className="mr-4">{node.name}</div>
                              {node.tags && node.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {node.tags.map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="secondary"
                                      className="text-xs"
                                      style={{ backgroundColor: tag.color }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CommandItem>
                          ))}
                          {searchQuery.length > 0 && (
                            <CommandItem
                              onClick={handleCreateNew}
                              onSelect={handleCreateNew}
                              className="cursor-pointer py-2"
                            >
                              <Plus className="w-4 h-4 mr-3" />
                              <div className="">
                                新規作成
                                <span className="text-red-500">
                                  「{searchQuery}」
                                </span>
                              </div>
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
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
};

export default Search;
