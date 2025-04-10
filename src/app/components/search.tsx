"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { getAllNodes, createNewNode } from "../actions/search";
import { Node, Tag } from "@prisma/client";
import { FileText, PlusCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Search: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  ...props
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
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
    router.push(`/node/${node.id}`);
    setSearchQuery("");
    setOpen(false);
  };

  // 何も見つからなかった場合に新規作成
  const handleCreateNew = async () => {
    try {
      const newNode = await createNewNode(searchQuery);
      console.log(newNode);
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
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="What are you searching for?"
            className="flex h-14 w-full bg-transparent text-sm placeholder:text-muted-foreground"
          />
          <Badge
            variant="outline"
            className="absolute right-2 top-1/2 -translate-y-1/2 font-normal cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Esc
          </Badge>
        </div>
        <CommandList className="overflow-y-auto max-h-96 py-1">
          <CommandGroup className="p-2 text-sm">
            {filteredNodes.map((node) => (
              <CommandItem
                key={node.id}
                onSelect={() => handleSelectItem(node)}
                className="cursor-pointer py-2"
              >
                <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
                <div className="flex">
                  <div className="line-clamp-1 flex-1 mr-4">{node.name}</div>
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
            {searchQuery.length > 0 && isAuthenticated && (
              <CommandItem
                onSelect={handleCreateNew}
                className="cursor-pointer py-2"
              >
                <PlusCircle className="w-4 h-4 mr-3" />
                <div className="">
                  Create
                  <span className="text-accent ml-2">{searchQuery}</span>
                </div>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Search;
