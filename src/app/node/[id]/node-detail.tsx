"use client";

import React, { useState, useEffect } from "react";
import Editor from "@/components/editor";
import { updateNodeDefinition, updateNodeName } from "./actions";
import TagManager from "./tag-manager";
import { Node, Tag } from "@prisma/client";
import { useAuth } from "@/components/providers/auth-provider";
import { AlertCircle } from "lucide-react";

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
  ({
    id,
    initialContent,
    isReadOnly,
  }: {
    id: string;
    initialContent: string;
    isReadOnly: boolean;
  }) => {
    const [content, setContent] = useState(initialContent);

    // コンテンツが変更されたらデータベースに保存する
    useEffect(() => {
      // 読み取り専用モードまたは初期表示時は保存しない
      if (isReadOnly || content === initialContent) return;

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
    }, [content, id, initialContent, isReadOnly]);

    return (
      <Editor content={content} onChange={setContent} readOnly={isReadOnly} />
    );
  }
);
NodeEditor.displayName = "NodeEditor";

// ノード名を編集するコンポーネント
const NodeNameEditor = React.memo(
  ({
    id,
    initialName,
    isReadOnly,
  }: {
    id: string;
    initialName: string;
    isReadOnly: boolean;
  }) => {
    const [nodeName, setNodeName] = useState(initialName);

    useEffect(() => {
      // 読み取り専用モードまたは初期値と同じ場合は更新しない
      if (isReadOnly || nodeName === initialName) return;

      const timer = setTimeout(() => {
        updateNodeName(id, nodeName);
      }, 1000);
      return () => clearTimeout(timer);
    }, [nodeName, id, initialName, isReadOnly]);

    if (isReadOnly) {
      return (
        <h1 className="leading-[1.5] tracking-wide text-4xl font-bold mb-4">
          {nodeName}
        </h1>
      );
    }

    return (
      <input
        className="leading-[1.5] border-none tracking-wide text-4xl font-bold mb-4 bg-transparent focus:outline-none focus:ring-0 w-full"
        value={nodeName}
        onChange={(e) => setNodeName(e.target.value)}
      />
    );
  }
);
NodeNameEditor.displayName = "NodeNameEditor";

const NodeDetail: React.FC<NodeDetailProps> = ({ id, node, allTags }) => {
  const { isAuthenticated } = useAuth();
  const isReadOnly = !isAuthenticated;

  return (
    <div className="w-[90%] mx-auto pt-24 pb-[80vh]">
      <div className="relative max-w-3xl mx-auto">
        {isReadOnly && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>
              閲覧モード：編集するには管理者としてログインしてください
            </span>
          </div>
        )}

        <div className="min-h-full flex flex-col">
          <div>
            <NodeNameEditor
              id={id}
              initialName={node.name}
              isReadOnly={isReadOnly}
            />

            {!isReadOnly && (
              <TagManager
                nodeId={id}
                currentTags={node.tags}
                allTags={allTags}
              />
            )}

            {isReadOnly && node.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {node.tags.map((tag) => (
                  <div key={tag.id} className="px-2 py-1 rounded-md text-sm">
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 mt-4">
            <NodeEditor
              id={id}
              initialContent={node.content}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
