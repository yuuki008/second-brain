"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import { generateExtensions } from "@/components/editor/extensions";
import "@/components/editor/styles/markdown.css";
import { type TableOfContentData } from "@tiptap-pro/extension-table-of-contents";
import ToC from "@/components/editor/components/toc";
import { updateNodeContent, updateNodeName } from "../actions";
import { Node, Tag } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import ReactionBar from "./reaction-bar";
import dayjs from "dayjs";
import { useZen } from "@/components/providers/zen-provider";
import { useSession } from "next-auth/react";
import NodeFooter from "./node-footer";
import Editor from "@/components/editor";

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

// ノード名を編集するコンポーネント
const NodeNameEditor = React.memo(
  ({
    id,
    initialName,
    isReadOnly,
    isZenMode,
    viewCount,
    lastUpdated,
  }: {
    id: string;
    initialName: string;
    isReadOnly: boolean;
    isZenMode: boolean;
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
      <div className="relative flex flex-col">
        <div>
          {isReadOnly ? (
            <h1 className="leading-[1.5] mb-2 tracking-wide text-3xl font-bold">
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
        {!isZenMode && (
          <div className="text-muted-foreground text-xs flex justify-between items-center">
            <div>{formatLastUpdated}</div>
            <div>{viewCount} views</div>
          </div>
        )}
      </div>
    );
  }
);

NodeNameEditor.displayName = "NodeNameEditor";

const NodeDetail: React.FC<NodeDetailProps> = ({ id, node, reactions }) => {
  const { data: session } = useSession();
  const { isZenMode } = useZen();
  const [tableOfContentData, setTableOfContentData] =
    useState<TableOfContentData>([]);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  const isNodeOwner = session?.user.id === node.userId;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: !isNodeOwner,
    editable: isNodeOwner,
    extensions: generateExtensions({ setTableOfContentData }),
    content: node.content,
    onUpdate: ({ editor }) => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      updateTimeout.current = setTimeout(async () => {
        try {
          await updateNodeContent(id, editor.getHTML());
        } catch (error) {
          console.error("保存エラー:", error);
        }
      }, 1000);
    },
    editorProps: {
      attributes: {
        class:
          "markdown-editor focus:outline-none dark:prose-invert h-full px-1",
      },
    },
  });

  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className={
        "w-full min-h-screen relative bg-background transition-all duration-300"
      }
    >
      {!isZenMode && <ToC items={tableOfContentData} editor={editor!} />}
      <div className="w-[90%] flex flex-col min-h-screen relative max-w-2xl mx-auto pb-20">
        <div className="flex-1 flex flex-col pt-14">
          <NodeNameEditor
            id={id}
            initialName={node.name}
            isReadOnly={!isNodeOwner}
            isZenMode={isZenMode}
            viewCount={node.viewCount}
            lastUpdated={node.updatedAt}
          />

          <div className="flex-1 mt-6">
            <Editor className="h-full" editor={editor} />

            {!isZenMode && (
              <>
                <Separator className="mt-14 mb-5" />
                <ReactionBar nodeId={id} initialReactions={reactions} />
              </>
            )}
          </div>
        </div>

        {session && <NodeFooter node={node} />}
      </div>
    </div>
  );
};

export default NodeDetail;
