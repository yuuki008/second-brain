"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// 必要な型定義
interface NodeData {
  id: string;
  name: string;
  tags: string[];
}

interface GraphData {
  nodes: NodeData[];
  links: {
    source: string;
    target: string;
  }[];
}

interface SearchComponentProps {
  graphData: GraphData;
  onTermSelect: (term: NodeData) => void;
  onCreateTerm: () => void;
}

const Search: React.FC<SearchComponentProps> = ({
  graphData,
  onTermSelect,
  onCreateTerm,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 検索結果のフィルタリング
  const filteredTerms = searchQuery
    ? graphData.nodes.filter((node) => {
        // 用語名での検索
        const nameMatch = node.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        // タグでの検索
        const tagMatch =
          node.tags &&
          node.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return nameMatch || tagMatch;
      })
    : [];

  // 検索フォームにフォーカスされたらオープン
  const handleFocus = () => {
    setOpen(true);
  };

  // 検索結果をクリックしたときの処理
  const handleSelectItem = (term: NodeData) => {
    onTermSelect(term);
    setSearchQuery("");
    setOpen(false);
  };

  // 何も見つからなかった場合に新規作成
  const handleCreateNew = () => {
    if (searchQuery) {
      onCreateTerm();
      setSearchQuery("");
      setOpen(false);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-lg px-4">
      <Command className="rounded-lg border" shouldFilter={false}>
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          onFocus={handleFocus}
          placeholder="用語を検索..."
          className="flex h-12 w-full bg-transparent py-3 text-sm placeholder:text-muted-foreground"
        />
        {open && searchQuery && (
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={handleCreateNew}
                className="cursor-pointer"
              >
                <div className="font-medium mr-2">
                  「{searchQuery}」の新規作成
                </div>
              </CommandItem>
              {filteredTerms.map((term) => (
                <CommandItem
                  key={term.id}
                  onSelect={() => handleSelectItem(term)}
                  className="cursor-pointer"
                >
                  <div className="font-medium mr-2">{term.name}</div>
                  {term.tags && term.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {term.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default Search;
