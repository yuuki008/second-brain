"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NetworkGraph from "@/app/components/NetworkGraph";

// 用語の型定義
interface TermNode {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

interface Term {
  id: string;
  name: string;
  definition: string;
  createdAt: Date;
  updatedAt: Date;
  tags: { id: string; name: string; color: string }[];
}

interface TermDetailProps {
  id: string;
  term: Term;
  graphData: {
    nodes: TermNode[];
    links: {
      source: string;
      target: string;
    }[];
  };
}

const TermDetail: React.FC<TermDetailProps> = ({ id, term, graphData }) => {
  const router = useRouter();
  const definitionRef = useRef<HTMLDivElement>(null);

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
            graphData={{
              nodes: graphData.nodes,
              links: graphData.links,
            }}
            activeTagId={null}
            onNodeSelect={handleTermSelect}
            centerNodeId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default TermDetail;
