"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const handleTermSelect = (selectedNode: TermNode) =>
    router.push(`/term/${selectedNode.id}`);

  return (
    <div className="h-screen w-full max-w-screen-2xl mx-auto  flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full py-10 px-8 lg:w-1/2 h-1/2 lg:h-full overflow-hidden flex flex-col border">
        <h1 className="text-4xl font-bold mb-8">{term.name}</h1>

        <ScrollArea className="flex-1">
          <div
            ref={definitionRef}
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: term.definition,
            }}
          />
        </ScrollArea>
      </div>

      {/* 右側: ネットワークグラフ */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative p-10">
        <div className="absolute inset-0 bg-background">
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
