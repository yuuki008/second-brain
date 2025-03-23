"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NetworkGraph from "@/app/components/NetworkGraph";
import { tagData, generateGraphData } from "@/data/graphData";
import { ScrollArea } from "@/components/ui/scroll-area";

// 用語の型定義
interface TermNode {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

interface TermDetailPageProps {
  params: {
    id: string;
  };
}

const TermDetailPage: React.FC<TermDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const definitionRef = useRef<HTMLDivElement>(null);

  // タグデータ
  const tags = useMemo(() => tagData, []);

  // グラフデータを生成
  const graphData = useMemo(() => generateGraphData(tags), [tags]);

  // 用語データを取得（実際のアプリではAPIから取得）
  const term = useMemo(() => {
    const node = graphData.nodes.find((node) => node.id === id);
    if (!node) return null;

    // 関連用語のリンク先を確保するために、すべての用語名のマップを作成
    const allTerms = graphData.nodes.reduce<Record<string, string>>(
      (acc, node) => {
        acc[node.name] = node.id;
        return acc;
      },
      {}
    );

    // リンク付きの定義文を作成
    let definition = `これは${node.name}の定義です。これは例として、`;

    // ランダムに2つの関連用語を選択してリンク化
    const relatedTermNames = Object.keys(allTerms).filter(
      (name) => name !== node.name
    );
    const randomIndex1 = Math.floor(Math.random() * relatedTermNames.length);
    let randomIndex2 = Math.floor(Math.random() * relatedTermNames.length);
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * relatedTermNames.length);
    }

    const relatedTerm1 = relatedTermNames[randomIndex1];
    const relatedTerm2 = relatedTermNames[randomIndex2];

    definition += `<span class="text-blue-600 cursor-pointer underline" data-term-id="${allTerms[relatedTerm1]}">${relatedTerm1}</span>や`;
    definition += `<span class="text-blue-600 cursor-pointer underline" data-term-id="${allTerms[relatedTerm2]}">${relatedTerm2}</span>などの関連用語へのリンクを含んでいます。`;

    return {
      id: node.id,
      name: node.name,
      definition,
      createdAt: new Date("2025-03-01"),
      updatedAt: new Date("2025-03-20"),
      tags: node.tags || [],
    };
  }, [graphData.nodes, id]);

  // 定義内のリンクをクリックしたときのイベントハンドラを設定
  useEffect(() => {
    const definitionElement = definitionRef.current;
    if (!definitionElement) return;

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "SPAN" && target.hasAttribute("data-term-id")) {
        const termId = target.getAttribute("data-term-id");
        if (termId) {
          router.push(`/term/${termId}`);
        }
      }
    };

    definitionElement.addEventListener("click", handleLinkClick);

    return () => {
      definitionElement.removeEventListener("click", handleLinkClick);
    };
  }, [router]);

  // 用語が見つからない場合
  if (!term) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>用語が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              トップページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 選択された用語を中心としたネットワークを表示
  const handleTermSelect = (selectedNode: TermNode) => {
    // 別の用語が選択された場合、その用語の詳細ページに遷移
    if (selectedNode.id !== id) {
      router.push(`/term/${selectedNode.id}`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
      {/* 左側: 用語詳細 */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full overflow-hidden flex flex-col">
        <header className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{term.name}</h1>
        </header>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* タグリスト */}
            {term.tags && term.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {term.tags.map((tag) => (
                  <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 用語の定義 */}
            <div
              ref={definitionRef}
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: term.definition,
              }}
            />

            {/* 更新日時 */}
            <div className="text-sm text-muted-foreground">
              最終更新: {term.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 右側: ネットワークグラフ */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative">
        <div className="absolute inset-0">
          <NetworkGraph
            graphData={graphData}
            activeTagId={null}
            onNodeSelect={handleTermSelect}
            centerNodeId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default TermDetailPage;
