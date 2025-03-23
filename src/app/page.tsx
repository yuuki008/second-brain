"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Term } from "@prisma/client";
import TagFilter, { HierarchicalTag } from "@/app/components/TagFilter";
import Search from "@/app/components/Search";
import NetworkGraph from "@/app/components/NetworkGraph";
import TagDetail from "@/app/components/TagDetail";
import TagCreate from "@/app/components/TagCreate";
import { tagData, generateGraphData } from "@/data/graphData";
import { ThemeToggle } from "@/app/components/ThemeToggle";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

const TopPage = () => {
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<
    (Term & { tags: { id: string; name: string; color: string }[] }) | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  // 階層構造を持つタグのサンプルデータ
  const tags = useMemo<HierarchicalTag[]>(() => tagData, []);

  // 選択されたタグとその子タグすべてのIDを収集する関数
  const collectTagAndChildrenIds = useCallback(
    (tagId: string | null): string[] => {
      if (!tagId) return [];

      const results: string[] = [tagId];
      const collectChildIds = (tags: HierarchicalTag[]) => {
        for (const tag of tags) {
          if (tag.id === tagId) {
            // このタグが見つかった場合、すべての子タグのIDを収集
            const collectIds = (tag: HierarchicalTag) => {
              if (tag.children && tag.children.length > 0) {
                for (const child of tag.children) {
                  results.push(child.id);
                  collectIds(child);
                }
              }
            };
            collectIds(tag);
            return true;
          }

          if (tag.children && tag.children.length > 0) {
            if (collectChildIds(tag.children)) {
              return true;
            }
          }
        }
        return false;
      };

      collectChildIds(tags);
      return results;
    },
    [tags]
  );

  // 選択されたタグとその全ての子タグのID
  const activeTagAndChildrenIds = useMemo(
    () => (activeTagId ? collectTagAndChildrenIds(activeTagId) : null),
    [activeTagId, collectTagAndChildrenIds]
  );

  // 100個のノードを持つグラフデータを生成
  const graphData = useMemo(() => generateGraphData(tags), [tags]);

  // 用語選択時の処理
  const handleTermSelect = (term: NodeData) => {
    setSelectedTerm({
      id: term.id,
      name: term.name,
      definition: `これは${term.name}の定義です。これは例として、<span class="text-blue-600 cursor-pointer underline">Next.js</span>や<span class="text-blue-600 cursor-pointer underline">Tailwind CSS</span>などの関連用語へのリンクを含んでいます。`,
      createdAt: new Date("2025-03-01"),
      updatedAt: new Date("2025-03-20"),
      tags: term.tags || [],
    });
    setShowTermModal(true);
  };

  // 新規用語作成モーダルを表示
  const handleCreateTerm = () => {
    setShowCreateModal(true);
    setShowTermModal(false);
  };

  // タグ選択時の処理
  const handleTagSelect = (tagId: string) => {
    setActiveTagId(activeTagId === tagId ? null : tagId);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* テーマ切り替えボタン */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* ネットワークグラフコンポーネント */}
      <NetworkGraph
        graphData={graphData}
        activeTagId={activeTagId}
        allTagIds={activeTagAndChildrenIds || undefined}
        onNodeSelect={handleTermSelect}
      />

      {/* タグフィルターコンポーネント */}
      <TagFilter
        tags={tags}
        activeTagId={activeTagId}
        onTagSelect={handleTagSelect}
      />

      {/* 検索コンポーネント */}
      <Search
        graphData={graphData}
        onTermSelect={handleTermSelect}
        onCreateTerm={handleCreateTerm}
      />

      {/* 用語詳細モーダルコンポーネント */}
      <TagDetail
        open={showTermModal}
        onOpenChange={setShowTermModal}
        selectedTerm={selectedTerm}
      />

      {/* 新規用語作成モーダルコンポーネント */}
      <TagCreate
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        tags={tags}
      />
    </div>
  );
};

export default TopPage;
