"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import NetworkGraph from "@/app/components/NetworkGraph";

interface TermNodeData {
  id: string;
  name: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface TermData {
  id: string;
  name: string;
  definition: string;
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface TermDetailProps {
  id: string;
  term: TermData;
  graphData: {
    nodes: TermNodeData[];
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
  const handleTermSelect = (selectedNode: TermNodeData) =>
    router.push(`/term/${selectedNode.id}`);

  return (
    <div className="h-screen w-full max-w-screen-xl p-10 mx-auto flex overflow-hidden">
      {/* 左側: 用語の説明 */}
      <div className="flex-1 h-full overflow-y-auto pr-10">
        <h1 className="text-[2.5em] font-bold mb-8">{term.name}</h1>

        <div
          ref={definitionRef}
          className="prose w-full dark:prose-invert leading-[1.9]"
          dangerouslySetInnerHTML={{
            __html: term.definition,
          }}
        />
      </div>

      {/* 右側: ネットワークグラフ */}
      <div className="w-[350px]">
        <div className="w-full h-[350px] border rounded-xl">
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
