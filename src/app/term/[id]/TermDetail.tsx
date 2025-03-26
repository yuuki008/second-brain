"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NetworkGraph from "@/app/components/NetworkGraph";
import Editor from "@/components/editor";
import { updateTermDefinition } from "./actions";
import TagManager, { TagWithChildren } from "./TagManager";
import { cn } from "@/lib/utils";

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
  tags: TagWithChildren[];
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

// エディタ部分のみを扱う別コンポーネント
const TermEditor = React.memo(
  ({ id, initialContent }: { id: string; initialContent: string }) => {
    const [content, setContent] = useState(initialContent);

    // コンテンツが変更されたらデータベースに保存する
    useEffect(() => {
      // 初期表示時は保存しない
      if (content === initialContent) return;

      // デバウンス処理のための変数
      const timer = setTimeout(async () => {
        try {
          await updateTermDefinition(id, content);
        } catch (error) {
          console.error("保存エラー:", error);
        }
      }, 1000); // 1秒のデバウンス

      // クリーンアップ関数
      return () => clearTimeout(timer);
    }, [content, id, initialContent]);

    return <Editor content={content} onChange={setContent} />;
  }
);
TermEditor.displayName = "TermEditor";

// ウィンドウ幅を監視するカスタムフック
function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

const TermDetail: React.FC<TermDetailProps> = ({ id, term, graphData }) => {
  const router = useRouter();
  const windowWidth = useWindowWidth();

  const onNodeSelect = (node: TermNodeData) => router.push(`/term/${node.id}`);

  return (
    <div className="h-screen w-[90%] max-w-screen-xl mx-auto flex overflow-hidden">
      {/* 左側: 用語の説明 */}
      <div
        className={cn(
          "flex-1 min-h-full flex flex-col overflow-y-auto py-10",
          windowWidth <= 1280 ? "pr-0 max-w-3xl mx-auto" : "pr-10"
        )}
      >
        <div>
          <h1 className="text-3xl font-bold mb-4">{term.name}</h1>
          <TagManager nodeId={id} currentTags={term.tags} />
        </div>

        <div className="flex-1">
          <TermEditor id={id} initialContent={term.definition} />
        </div>
      </div>

      {/* 右側: ネットワークグラフ */}
      {windowWidth > 1280 && (
        <div className="w-[350px] py-10">
          <div className="w-full h-[350px] border rounded-xl">
            <NetworkGraph
              key={id}
              graphData={graphData}
              activeTagId={null}
              onNodeSelect={onNodeSelect}
              centerNodeId={id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TermDetail;
