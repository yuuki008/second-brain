"use client";

import React, { useState, useEffect } from "react";
import Editor from "@/components/editor";
import { updateNodeDefinition, updateNodeName } from "../actions";
import { Node, Tag } from "@prisma/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Separator } from "@/components/ui/separator";
import ReactionBar from "./reaction-bar";
import HelpMenu from "./help-menu";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useZen } from "@/hooks/use-zen";

interface NodeNodeData {
  id: string;
  name: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

// 絵文字とカウントの型
interface EmojiCount {
  emoji: string;
  count: number;
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
  reactions: EmojiCount[];
}

// エディタ部分のみを扱う別コンポーネント
const NodeEditor = React.memo(
  ({
    id,
    initialContent,
    isReadOnly,
    isZenMode,
  }: {
    id: string;
    initialContent: string;
    isReadOnly: boolean;
    isZenMode: boolean;
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
      <Editor
        content={content}
        onChange={setContent}
        readOnly={isReadOnly}
        isZenMode={isZenMode}
      />
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
    viewCount,
    lastUpdated,
  }: {
    id: string;
    initialName: string;
    isReadOnly: boolean;
    viewCount: number;
    lastUpdated: Date;
  }) => {
    const [nodeName, setNodeName] = useState(initialName);

    useEffect(() => {
      // 読み取り専用モードまたは初期値と同じ場合は更新しない
      if (isReadOnly || nodeName === initialName) return;

      const timer = setTimeout(async () => {
        await updateNodeName(id, nodeName);
      }, 1000);
      return () => clearTimeout(timer);
    }, [nodeName, id, initialName, isReadOnly]);

    const formatLastUpdated = dayjs(lastUpdated).format("MMMM D, YYYY");

    return (
      <div className="relative flex flex-col my-4">
        <div>
          {isReadOnly ? (
            <h1 className="leading-[1.5] tracking-wide text-3xl font-bold">
              {nodeName}
            </h1>
          ) : (
            <textarea
              className="min-w-full max-w-full field-sizing-content resize-none border-none tracking-wide text-3xl font-bold bg-transparent focus:outline-none focus:ring-0 leading-[1.5]"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
            />
          )}
        </div>
        <div className="text-muted-foreground text-xs flex justify-between items-center">
          <div>{formatLastUpdated}</div>

          <div>{viewCount} views</div>
        </div>
      </div>
    );
  }
);

NodeNameEditor.displayName = "NodeNameEditor";

const NodeDetail: React.FC<NodeDetailProps> = ({
  id,
  node,
  allTags,
  reactions,
}) => {
  const { isAuthenticated } = useAuth();
  const { isZenMode, toggleZenMode } = useZen();

  return (
    <div
      className={cn(
        "w-full min-h-screen relative bg-background transition-all duration-300",
        // 禅モードの時は z-index を 100 にしてヘッダーを非表示にする
        isZenMode && isAuthenticated ? "z-[100]" : "z-0"
      )}
    >
      <div className="w-[90%] flex flex-col min-h-screen relative max-w-2xl mx-auto pb-20">
        <div className="flex-1 flex flex-col pt-14">
          <NodeNameEditor
            id={id}
            initialName={node.name}
            isReadOnly={!isAuthenticated}
            viewCount={node.viewCount}
            lastUpdated={node.updatedAt}
          />

          <div className="flex-1 mt-6">
            <NodeEditor
              id={id}
              initialContent={node.content}
              isReadOnly={!isAuthenticated}
              isZenMode={isZenMode}
            />

            {(!isZenMode || !isAuthenticated) && (
              <>
                <Separator className="mt-14 mb-5" />
                <ReactionBar nodeId={id} initialReactions={reactions} />
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <HelpMenu
            nodeId={id}
            currentTags={node.tags}
            allTags={allTags}
            isZenMode={isZenMode}
            toggleZenMode={toggleZenMode}
          />
        )}
      </div>
    </div>
  );
};

export default NodeDetail;
