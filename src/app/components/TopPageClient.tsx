"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import TagFilter, { HierarchicalTag } from "@/app/components/TagFilter";
import Search from "@/app/components/Search";
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
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

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

  // 用語選択時の処理
  const handleTermSelect = (term: NodeData) => {
    router.push(`/term/${term.id}`);
  };

  // タグ選択時の処理
  const handleTagSelect = (tagId: string) => {
    setActiveTagId(activeTagId === tagId ? null : tagId);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 flex justify-end p-4 z-20">
        <TagFilter
          tags={tags}
          activeTagId={activeTagId}
          onTagSelect={handleTagSelect}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 relative">
        {/* ネットワークグラフコンポーネント */}
        <NetworkGraph
          graphData={graphData}
          activeTagId={activeTagId}
          allTagIds={activeTagAndChildrenIds || undefined}
          onNodeSelect={handleTermSelect}
        />

        <Search graphData={graphData} onTermSelect={handleTermSelect} />
      </div>
    </div>
  );
}
