"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NetworkGraph from "@/app/components/NetworkGraph";
import Editor from "@/components/editor";
import { updateNodeDefinition, updateNodeName } from "./actions";
import TagManager from "./TagManager";
import { Node, Tag } from "@prisma/client";

interface NodeNodeData {
  id: string;
  name: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface NodeDetailProps {
  id: string;
  node: Node & { tags: Tag[] };
  allTags: Tag[];
  graphData: {
    nodes: NodeNodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
}

// エディタ部分のみを扱う別コンポーネント
const NodeEditor = React.memo(
  ({ id, initialContent }: { id: string; initialContent: string }) => {
    const [content, setContent] = useState(initialContent);

    // コンテンツが変更されたらデータベースに保存する
    useEffect(() => {
      // 初期表示時は保存しない
      if (content === initialContent) return;

      // デバウンス処理のための変数
      const timer = setTimeout(async () => {
        try {
          await updateNodeDefinition(id, content);
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
NodeEditor.displayName = "NodeEditor";

// ノード名を編集するコンポーネント
const NodeNameEditor = React.memo(
  ({ id, initialName }: { id: string; initialName: string }) => {
    const [nodeName, setNodeName] = useState(initialName);

    useEffect(() => {
      const timer = setTimeout(() => {
        updateNodeName(id, nodeName);
      }, 1000);
      return () => clearTimeout(timer);
    }, [nodeName, id]);

    return (
      <input
        className="w-full border-none text-4xl font-bold mb-4 bg-transparent focus:outline-none focus:ring-0"
        value={nodeName}
        onChange={(e) => setNodeName(e.target.value)}
      />
    );
  }
);
NodeNameEditor.displayName = "NodeNameEditor";

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

const NodeDetail: React.FC<NodeDetailProps> = ({
  id,
  node,
  graphData,
  allTags,
}) => {
  const router = useRouter();
  const windowWidth = useWindowWidth();

  const onNodeSelect = (nodeData: NodeNodeData) =>
    router.push(`/node/${nodeData.id}`);

  return (
    <div className="w-[90%] mx-auto pb-[80vh]">
      <div className="relative max-w-3xl mx-auto">
        <div className="min-h-full flex flex-col py-10">
          <div className="flex justify-between items-end">
            <div>
              <NodeNameEditor id={id} initialName={node.name} />

              <TagManager
                nodeId={id}
                currentTags={node.tags}
                allTags={allTags}
              />
            </div>
            {windowWidth > 768 && (
              <div className="w-[230px] h-[180px] border rounded-xl">
                <NetworkGraph
                  key={id}
                  graphData={graphData}
                  onNodeSelect={onNodeSelect}
                  centerNodeId={id}
                />
              </div>
            )}
          </div>

          <div className="flex-1 mt-4">
            <NodeEditor id={id} initialContent={node.content} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
