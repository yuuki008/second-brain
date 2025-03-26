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
      setFilteredNodes([]);
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
    router.push(`/node/${node.id}`);
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

  if (!open) return <></>;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg">
      <Command className="rounded-lg border shadow-md" shouldFilter={false}>
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="検索するには ⌘K を押す..."
          className="flex h-12 w-full bg-transparent text-sm placeholder:text-muted-foreground"
          autoFocus={true}
        />
        {open && (
          <CommandList className="max-h-96 overflow-y-auto border-none">
            <CommandGroup className="p-0">
              {searchQuery.length > 0 ? (
                <div className="border-t">
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="cursor-pointer py-2"
                  >
                    <div className="font-medium">
                      新規作成
                      <span className="text-red-500">「{searchQuery}」</span>
                    </div>
                  </CommandItem>
                  {filteredNodes.map((node) => (
                    <CommandItem
                      key={node.id}
                      onSelect={() => handleSelectItem(node)}
                      className="cursor-pointer py-2"
                    >
                      <div className="font-medium mr-2">{node.name}</div>
                      {node.tags && node.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
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
                </div>
              ) : (
                <></>
              )}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default Search;
