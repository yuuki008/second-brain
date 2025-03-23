"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import TagFilter, { HierarchicalTag } from "@/app/components/TagFilter";
import Search from "@/app/components/Search";
import NetworkGraph from "@/app/components/NetworkGraph";
import TagCreate from "@/app/components/TagCreate";
import { tagData, generateGraphData } from "@/data/graphData";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

const TopPage = () => {
  const router = useRouter();
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
    router.push(`/term/${term.id}`);
  };

  // 新規用語作成モーダルを表示
  const handleCreateTerm = () => {
    setShowCreateModal(true);
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

        {/* ウェルカムカード */}
        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-72">
          <Card className="bg-background/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                ナレッジグラフへようこそ
              </CardTitle>
              <CardDescription>用語をクリックして詳細を確認</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                このグラフは知識のつながりを視覚化しています。タグでフィルタリングしたり、検索して特定の用語を見つけることができます。
              </p>
            </CardContent>
          </Card>
        </div> */}
        <Search
          graphData={graphData}
          onTermSelect={handleTermSelect}
          onCreateTerm={handleCreateTerm}
        />
      </div>

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
