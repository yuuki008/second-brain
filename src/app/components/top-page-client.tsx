"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import TagFilter, { HierarchicalTag } from "@/app/components/tag-filter";
import NetworkGraph from "@/app/components/network-graph";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { createNode } from "@/app/actions/node";

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
  const { isAuthenticated } = useAuth();

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

  // フィルタリングされたグラフデータ
  const filteredGraphData = useMemo(() => {
    if (!activeTagAndChildrenIds) return graphData;

    // 選択されたタグに関連するノードをフィルタリング
    const filteredNodes = graphData.nodes.filter((node) =>
      node.tags.some((tag) => activeTagAndChildrenIds.includes(tag.id))
    );

    // フィルタリングされたノードのIDセットを作成
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // フィルタリングされたノード間のリンクのみを保持
    const filteredLinks = graphData.links.filter(
      (link) =>
        filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
    );

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [graphData, activeTagAndChildrenIds]);

  // ノード選択時の処理
  const handleNodeSelect = (node: NodeData) => {
    router.push(`/node/${node.id}`);
  };

  // タグ選択時の処理
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 新規ノード作成処理
  const handleCreateNode = async () => {
    try {
      const newNode = await createNode("新しいノード");
      router.push(`/node/${newNode.id}`);
    } catch (error) {
      console.error("ノード作成エラー:", error);
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 flex justify-between px-20 pt-20 z-20">
        <div>
          {isAuthenticated && (
            <Button
              onClick={handleCreateNode}
              className="flex items-center gap-2"
              variant="outline"
            >
              <PlusCircle className="h-4 w-4" />
              <span>新しいノード</span>
            </Button>
          )}
        </div>
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
          graphData={filteredGraphData}
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}
