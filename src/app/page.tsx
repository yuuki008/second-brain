"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Term } from "@prisma/client";
import TagFilter, { HierarchicalTag } from "@/app/components/TagFilter";
import Search from "@/app/components/Search";
import NetworkGraph from "@/app/components/NetworkGraph";

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
  const tags = useMemo<HierarchicalTag[]>(
    () => [
      {
        id: "tag1",
        name: "プログラミング",
        color: "#3B82F6",
        parentId: null,
        children: [
          {
            id: "tag2",
            name: "フロントエンド",
            color: "#60A5FA",
            parentId: "tag1",
            children: [
              {
                id: "tag3",
                name: "ライブラリ",
                color: "#93C5FD",
                parentId: "tag2",
                children: [],
              },
              {
                id: "tag4",
                name: "フレームワーク",
                color: "#BFDBFE",
                parentId: "tag2",
                children: [],
              },
              {
                id: "tag5",
                name: "UI",
                color: "#DBEAFE",
                parentId: "tag2",
                children: [],
              },
            ],
          },
          {
            id: "tag6",
            name: "バックエンド",
            color: "#34D399",
            parentId: "tag1",
            children: [
              {
                id: "tag7",
                name: "ランタイム",
                color: "#6EE7B7",
                parentId: "tag6",
                children: [],
              },
            ],
          },
          {
            id: "tag8",
            name: "言語",
            color: "#F59E0B",
            parentId: "tag1",
            children: [
              {
                id: "tag9",
                name: "型システム",
                color: "#FBBF24",
                parentId: "tag8",
                children: [],
              },
              {
                id: "tag10",
                name: "Web",
                color: "#FCD34D",
                parentId: "tag8",
                children: [],
              },
            ],
          },
        ],
      },
    ],
    []
  );

  // 階層構造をフラットなリストに変換する関数
  const flattenTags = useCallback(
    (tags: HierarchicalTag[]): HierarchicalTag[] => {
      let result: HierarchicalTag[] = [];
      for (const tag of tags) {
        result.push(tag);
        if (tag.children && tag.children.length > 0) {
          result = [...result, ...flattenTags(tag.children)];
        }
      }
      return result;
    },
    []
  );

  // フラットなタグリスト
  const flatTags = useMemo(() => flattenTags(tags), [tags, flattenTags]);

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

  // サンプルデータの拡張版（タグ付き）
  const graphData = useMemo(
    () => ({
      nodes: [
        // プログラミング関連
        {
          id: "1",
          name: "React",
          tags: [
            flatTags.find((t) => t.id === "tag2")!, // フロントエンド
            flatTags.find((t) => t.id === "tag3")!, // ライブラリ
            flatTags.find((t) => t.id === "tag5")!, // UI
          ],
        },
        {
          id: "2",
          name: "Next.js",
          tags: [
            flatTags.find((t) => t.id === "tag2")!, // フロントエンド
            flatTags.find((t) => t.id === "tag4")!, // フレームワーク
          ],
        },
        {
          id: "3",
          name: "Vue.js",
          tags: [
            flatTags.find((t) => t.id === "tag2")!, // フロントエンド
            flatTags.find((t) => t.id === "tag4")!, // フレームワーク
            flatTags.find((t) => t.id === "tag5")!, // UI
          ],
        },
        {
          id: "4",
          name: "Angular",
          tags: [
            flatTags.find((t) => t.id === "tag2")!, // フロントエンド
            flatTags.find((t) => t.id === "tag4")!, // フレームワーク
            flatTags.find((t) => t.id === "tag5")!, // UI
          ],
        },
        {
          id: "5",
          name: "TypeScript",
          tags: [
            flatTags.find((t) => t.id === "tag8")!, // 言語
            flatTags.find((t) => t.id === "tag9")!, // 型システム
          ],
        },
        {
          id: "6",
          name: "JavaScript",
          tags: [
            flatTags.find((t) => t.id === "tag8")!, // 言語
            flatTags.find((t) => t.id === "tag2")!, // フロントエンド
            flatTags.find((t) => t.id === "tag10")!, // Web
          ],
        },
        {
          id: "7",
          name: "Node.js",
          tags: [
            flatTags.find((t) => t.id === "tag6")!, // バックエンド
            flatTags.find((t) => t.id === "tag7")!, // ランタイム
          ],
        },
      ],
      links: [
        // React関連
        { source: "1", target: "2" },
        { source: "1", target: "3" },
        { source: "1", target: "5" },
        { source: "1", target: "6" },
        // Vue関連
        { source: "3", target: "5" },
        { source: "3", target: "6" },
        // Angular関連
        { source: "4", target: "5" },
        { source: "4", target: "6" },
        // TypeScript/JavaScript関連
        { source: "5", target: "6" },
        { source: "6", target: "7" },
        // Node.js関連
        { source: "7", target: "5" },
      ],
    }),
    [flatTags]
  );

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
    <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
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

      {/* 用語詳細モーダル */}
      <Dialog open={showTermModal} onOpenChange={setShowTermModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTerm?.name}</DialogTitle>
            {selectedTerm?.tags && selectedTerm.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTerm.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: selectedTerm?.definition || "",
            }}
          />

          <DialogFooter>
            <Button variant="outline">編集</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規用語作成モーダル */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規用語の作成</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                用語名
              </label>
              <Input placeholder="用語名を入力" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                タグ
              </label>
              <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                {tags.map((rootTag) => (
                  <div key={rootTag.id} className="mb-2">
                    <div className="font-medium mb-1">{rootTag.name}</div>
                    <div className="pl-4 space-y-1">
                      {rootTag.children?.map((childTag) => (
                        <div key={childTag.id}>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span>{childTag.name}</span>
                          </label>
                          {childTag.children &&
                            childTag.children.length > 0 && (
                              <div className="pl-6 space-y-1 mt-1">
                                {childTag.children.map((grandchildTag) => (
                                  <label
                                    key={grandchildTag.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded"
                                    />
                                    <span>{grandchildTag.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                定義/説明
              </label>
              <Textarea
                className="h-32"
                placeholder="マークダウン形式で入力できます..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              キャンセル
            </Button>
            <Button>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopPage;
