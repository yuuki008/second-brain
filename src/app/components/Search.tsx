"use client";

import React, { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // 検索フォーム送信処理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索クエリがあり、検索結果がない場合
    if (searchQuery && filteredTerms.length === 0) {
      onCreateTerm();
    }
  };

  // 検索結果をクリックしたときの処理
  const handleSearchResultClick = (term: NodeData) => {
    onTermSelect(term);
    setSearchQuery("");
  };

  // 検索結果表示部分
  const renderSearchResults = () => {
    if (!searchQuery || filteredTerms.length === 0) return <></>;

    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-20 overflow-hidden">
        <ScrollArea className="max-h-60">
          <div className="divide-y">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSearchResultClick(term)}
              >
                <div className="font-medium">{term.name}</div>
                {term.tags && term.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {term.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    );
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-lg px-4">
      <div className="relative">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex relative items-center">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="用語を検索..."
              className="pl-10 pr-5 py-6 rounded-full shadow-md bg-white border-none"
            />
          </div>
        </form>

        {/* 検索結果ドロップダウン */}
        {renderSearchResults()}
      </div>
    </div>
  );
};

export default Search;
