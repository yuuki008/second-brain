"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import TagFilter, { HierarchicalTag } from "@/app/components/TagFilter";
import NetworkGraph from "@/app/components/NetworkGraph";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

interface TopPageClientProps {
  tags: HierarchicalTag[];
  graphData: {
    nodes: NodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
}

export default function TopPageClient({ tags, graphData }: TopPageClientProps) {
  const router = useRouter();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // 選択されたタグとその子タグすべてのIDを収集する関数
  const collectTagAndChildrenIds = useCallback(
    (tagIds: string[]): string[] => {
      if (tagIds.length === 0) return [];

      const results: string[] = [...tagIds];
      const collectChildIds = (tags: HierarchicalTag[]) => {
        for (const tag of tags) {
          if (tagIds.includes(tag.id)) {
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
          }

          if (tag.children && tag.children.length > 0) {
            collectChildIds(tag.children);
          }
        }
      };

      collectChildIds(tags);
      return [...new Set(results)]; // 重複を除去
    },
    [tags]
  );

  // 選択されたタグとその全ての子タグのID
  const activeTagAndChildrenIds = useMemo(
    () =>
      selectedTagIds.length > 0
        ? collectTagAndChildrenIds(selectedTagIds)
        : null,
    [selectedTagIds, collectTagAndChildrenIds]
  );

  // 用語選択時の処理
  const handleTermSelect = (term: NodeData) => {
    router.push(`/term/${term.id}`);
  };

  // タグ選択時の処理
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 flex justify-end p-4 z-20">
        <TagFilter
          tags={tags}
          selectedTagIds={selectedTagIds}
          onTagToggle={handleTagToggle}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 relative">
        {/* ネットワークグラフコンポーネント */}
        <NetworkGraph
          graphData={graphData}
          activeTagId={selectedTagIds.length === 1 ? selectedTagIds[0] : null}
          allTagIds={activeTagAndChildrenIds || undefined}
          onNodeSelect={handleTermSelect}
        />
      </div>
    </div>
  );
}
