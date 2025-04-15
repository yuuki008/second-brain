"use client";

import React, { useState, useEffect } from "react";
import Editor from "@/components/editor";
import {
  updateNodeDefinition,
  updateNodeName,
  toggleReaction,
  getVisitorReactions,
} from "../actions";
import { Node, Tag } from "@prisma/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getOrCreateVisitorId } from "@/lib/visitor-id";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import HelpMenu from "./help-menu";
import dayjs from "dayjs";

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

// リアクションコンポーネント
const ReactionBar = React.memo(
  ({
    nodeId,
    initialReactions,
  }: {
    nodeId: string;
    initialReactions: EmojiCount[];
  }) => {
    const { theme } = useTheme();
    const [reactions, setReactions] = useState<EmojiCount[]>(initialReactions);
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [visitorId, setVisitorId] = useState<string>("");

    // 訪問者IDの取得とリアクション状態の初期化
    useEffect(() => {
      const initVisitor = async () => {
        const id = getOrCreateVisitorId();
        setVisitorId(id);

        if (id) {
          // この訪問者のリアクションを取得
          const userReactions = await getVisitorReactions(nodeId, id);
          setSelectedEmojis(userReactions);
        }
      };

      initVisitor();
    }, [nodeId]);

    const handleReaction = async (emoji: string) => {
      if (!visitorId) return;

      try {
        toggleReaction(nodeId, emoji, visitorId);

        // 選択状態をトグル
        const newSelectedEmojis = selectedEmojis.includes(emoji)
          ? selectedEmojis.filter((e) => e !== emoji)
          : [...selectedEmojis, emoji];

        setSelectedEmojis(newSelectedEmojis);

        // 楽観的UI更新
        const existingIndex = reactions.findIndex((r) => r.emoji === emoji);
        const delta = selectedEmojis.includes(emoji) ? -1 : 1;

        if (existingIndex >= 0) {
          // 既存の絵文字のカウントを更新
          const newCount = reactions[existingIndex].count + delta;
          if (newCount <= 0) {
            // カウントが0以下になったら削除
            setReactions(reactions.filter((_, i) => i !== existingIndex));
          } else {
            const updatedReactions = [...reactions];
            updatedReactions[existingIndex] = {
              ...updatedReactions[existingIndex],
              count: newCount,
            };
            setReactions(updatedReactions);
          }
        } else if (delta > 0) {
          // 新しい絵文字を追加
          setReactions([
            ...reactions,
            {
              emoji,
              count: 1,
            },
          ]);
        }
      } catch (error) {
        console.error("リアクションエラー:", error);
      } finally {
        setOpen(false);
      }
    };

    return (
      <div className="flex flex-wrap gap-2 my-4 items-center">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full font-light"
              aria-label="絵文字を追加"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="p-0 border-none"
            sideOffset={5}
            align="start"
          >
            <Picker
              theme={theme}
              data={data}
              onEmojiSelect={(emoji: { native: string }) => {
                handleReaction(emoji.native);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {reactions.map((reaction) => (
          <Button
            key={reaction.emoji}
            variant={
              selectedEmojis.includes(reaction.emoji) ? "secondary" : "outline"
            }
            className={cn("flex items-center gap-1 px-2 py-1 h-8 rounded-full")}
            onClick={() => handleReaction(reaction.emoji)}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
          </Button>
        ))}
      </div>
    );
  }
);
ReactionBar.displayName = "ReactionBar";

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
  const isReadOnly = !isAuthenticated;

  return (
    <div className="w-[90%] flex flex-col min-h-screen relative max-w-2xl mx-auto pb-20">
      <div className="flex-1 flex flex-col pt-14">
        <NodeNameEditor
          id={id}
          initialName={node.name}
          isReadOnly={isReadOnly}
          viewCount={node.viewCount}
          lastUpdated={node.updatedAt}
        />

        <div className="flex-1 mt-6">
          <NodeEditor
            id={id}
            initialContent={node.content}
            isReadOnly={isReadOnly}
          />

          <Separator className="mt-14 mb-5" />

          <ReactionBar nodeId={id} initialReactions={reactions} />
        </div>
      </div>
      {!isReadOnly && (
        <HelpMenu nodeId={id} currentTags={node.tags} allTags={allTags} />
      )}
    </div>
  );
};

export default NodeDetail;
