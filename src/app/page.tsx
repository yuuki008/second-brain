"use client";

import React, { useState, useMemo } from "react";
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
import TagFilter from "@/app/components/TagFilter";
import Search from "@/app/components/Search";
import NetworkGraph from "@/app/components/NetworkGraph";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: string[];
}

const TopPage = () => {
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<
    (Term & { tags: string[] }) | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // サンプルデータの拡張版（タグ付き）
  const graphData = useMemo(
    () => ({
      nodes: [
        // プログラミング関連
        {
          id: "1",
          name: "React",
          tags: ["フロントエンド", "ライブラリ", "UI"],
        },
        {
          id: "2",
          name: "Next.js",
          tags: ["フロントエンド", "フレームワーク", "React"],
        },
        {
          id: "3",
          name: "Vue.js",
          tags: ["フロントエンド", "フレームワーク", "UI"],
        },
        {
          id: "4",
          name: "Angular",
          tags: ["フロントエンド", "フレームワーク", "UI"],
        },
        {
          id: "5",
          name: "TypeScript",
          tags: ["言語", "JavaScript", "型システム"],
        },
        {
          id: "6",
          name: "JavaScript",
          tags: ["言語", "フロントエンド", "Web"],
        },
        {
          id: "7",
          name: "Node.js",
          tags: ["バックエンド", "JavaScript", "ランタイム"],
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
    []
  );

  // 全てのタグをリストアップ
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    graphData.nodes.forEach((node) => {
      if (node.tags) {
        node.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [graphData]);

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
  const handleTagSelect = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
      {/* ネットワークグラフコンポーネント */}
      <NetworkGraph
        graphData={graphData}
        activeTag={activeTag}
        onNodeSelect={handleTermSelect}
      />

      {/* タグフィルターコンポーネント */}
      <TagFilter
        allTags={allTags}
        activeTag={activeTag}
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
                  <Badge key={tag} variant="secondary">
                    {tag}
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
              <Input placeholder="カンマ区切りで入力（例: フロントエンド, React, UI）" />
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
