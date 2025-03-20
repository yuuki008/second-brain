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
import { tagData, generateGraphData } from "@/data/graphData";
import { Pencil } from "lucide-react";

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
            <DialogTitle className="text-2xl font-bold">
              {selectedTerm?.name}
            </DialogTitle>
            {selectedTerm?.tags && selectedTerm.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
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
