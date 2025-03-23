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

// 関連ノードを取得する関数
function getRelatedNodes(
  nodeId: string,
  nodes: TermNode[],
  links: { source: string; target: string }[]
): TermNode[] {
  // ノードIDをキーに持つマップを作成
  const nodesMap = new Map<string, TermNode>();
  nodes.forEach((node) => nodesMap.set(node.id, node));

  // 訪問済みノードを追跡するセット
  const visited = new Set<string>();
  // 関連ノードを保持する配列
  const relatedNodes: TermNode[] = [];
  // 探索するノードIDのキュー
  const queue: string[] = [nodeId];

  // 幅優先探索で関連ノードを見つける
  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // 既に訪問済みならスキップ
    if (visited.has(currentId)) continue;

    // 訪問済みとしてマーク
    visited.add(currentId);

    // ノードを関連ノードリストに追加
    const node = nodesMap.get(currentId);
    if (node) relatedNodes.push(node);

    // このノードに直接接続しているノードをキューに追加
    links.forEach((link) => {
      if (link.source === currentId && !visited.has(link.target)) {
        queue.push(link.target);
      }
      if (link.target === currentId && !visited.has(link.source)) {
        queue.push(link.source);
      }
    });
  }

  return relatedNodes;
}

// 関連リンクを取得する関数
function getRelatedLinks(
  nodeIds: Set<string>,
  links: { source: string; target: string }[]
): { source: string; target: string }[] {
  return links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  );
}

const TermDetailPage: React.FC<TermDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const definitionRef = useRef<HTMLDivElement>(null);

  // タグデータ
  const tags = useMemo(() => tagData, []);

  // グラフデータを生成
  const allGraphData = useMemo(() => generateGraphData(tags), [tags]);

  // 選択された用語と関連する用語のみのグラフデータを作成
  const graphData = useMemo(() => {
    // 関連ノードを取得
    const relatedNodes = getRelatedNodes(
      id,
      allGraphData.nodes,
      allGraphData.links
    );

    // 関連ノードのIDのセットを作成
    const relatedNodeIds = new Set(relatedNodes.map((node) => node.id));

    // 関連ノード間のリンクを取得
    const relatedLinks = getRelatedLinks(relatedNodeIds, allGraphData.links);

    return {
      nodes: relatedNodes,
      links: relatedLinks,
    };
  }, [id, allGraphData]);

  // 用語データを取得（実際のアプリではAPIから取得）
  const term = useMemo(() => {
    // 元のすべてのノードから特定のノードを検索
    const node = allGraphData.nodes.find((node) => node.id === id);
    if (!node) return null;

    // 関連用語のリンク先を確保するために、すべての用語名のマップを作成
    const allTerms = allGraphData.nodes.reduce<Record<string, string>>(
      (acc, node) => {
        acc[node.name] = node.id;
        return acc;
      },
      {}
    );

    // リンク付きの定義文を作成
    let definition = `これは${node.name}の定義です。これは例として、`;

    // 関連ノードのうち、現在のノードではないものをフィルタリング
    const connectedNodeNames = graphData.nodes
      .filter((n) => n.id !== id)
      .map((n) => n.name);

    // 関連ノードがあれば使用、なければ全ノードからランダムに選択
    let relatedTermNames: string[] = [];
    if (connectedNodeNames.length >= 2) {
      relatedTermNames = connectedNodeNames;
    } else {
      relatedTermNames = Object.keys(allTerms).filter(
        (name) => name !== node.name
      );
    }

    // ランダムに2つの関連用語を選択してリンク化
    const randomIndex1 = Math.floor(Math.random() * relatedTermNames.length);
    let randomIndex2 = Math.floor(Math.random() * relatedTermNames.length);
    while (randomIndex2 === randomIndex1 && relatedTermNames.length > 1) {
      randomIndex2 = Math.floor(Math.random() * relatedTermNames.length);
    }

    const relatedTerm1 = relatedTermNames[randomIndex1];
    const relatedTerm2 =
      relatedTermNames[randomIndex2 % relatedTermNames.length];

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
  }, [id, allGraphData, graphData.nodes]);

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

            {/* 関連用語数の表示 */}
            <div className="text-sm">
              関連用語: {graphData.nodes.length - 1}個
            </div>

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
