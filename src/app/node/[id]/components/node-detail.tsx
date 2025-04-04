"use client";

import React, { useState, useEffect } from "react";
import Editor from "@/components/editor";
import {
  updateNodeDefinition,
  updateNodeName,
  updateNodeImageUrl,
  toggleReaction,
  getVisitorReactions,
} from "../actions";
import TagManager from "./tag-manager";
import { Node, Tag } from "@prisma/client";
import { useAuth } from "@/components/providers/auth-provider";
import { uploadFile } from "@/app/actions/supabase";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SmilePlus, Trash2, Image as ImageIcon } from "lucide-react";
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

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
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
      </div>
    );
  }
);
ReactionBar.displayName = "ReactionBar";

// サムネイル画像アップロードコンポーネント
const ThumbnailUploader = React.memo(
  ({
    id,
    initialImgUrl,
    isReadOnly,
  }: {
    id: string;
    initialImgUrl?: string | null;
    isReadOnly: boolean;
  }) => {
    const [imgUrl, setImgUrl] = useState(initialImgUrl || null);

    const handleImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (!e.target.files || e.target.files.length === 0) return;

      try {
        const file = e.target.files[0];
        const { url } = await uploadFile(file);
        setImgUrl(url);

        // ノードのimageUrlを更新
        await updateNodeImageUrl(id, url);
      } catch (error) {
        console.error("画像アップロードエラー:", error);
      }
    };

    const handleImageDelete = async () => {
      try {
        // 画像URLをnullに設定してデータベースを更新
        await updateNodeImageUrl(id, null);
        setImgUrl(null);
      } catch (error) {
        console.error("画像削除エラー:", error);
      }
    };

    if (!imgUrl && isReadOnly) return <></>;
    if (imgUrl && isReadOnly)
      return (
        <div className="w-full mb-6">
          <div className="relative w-full">
            <Image
              src={imgUrl || ""}
              alt="ノードサムネイル"
              width={1000}
              height={0}
              style={{ width: "100%", height: "auto" }}
              className="object-cover"
            />
          </div>
        </div>
      );

    if (!imgUrl) {
      return (
        <div className="w-full flex">
          <Button size="icon" className="relative" variant="outline">
            <label
              htmlFor="thumbnailUpload"
              className="absolute inset-0 cursor-pointer"
            />
            <ImageIcon className="h-4 w-4" />
          </Button>

          <input
            id="thumbnailUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="relative w-full overflow-hidden">
          <label
            htmlFor="thumbnailUpload"
            className="absolute inset-0 cursor-pointer z-10 hover:bg-black/30 transition-colors duration-300"
          />
          <div className="relative w-full">
            <Image
              src={imgUrl}
              alt="ノードサムネイル"
              width={1000}
              height={0}
              style={{ width: "100%", height: "auto" }}
              className="object-cover max-h-[640px]"
            />
          </div>
          <Button
            onClick={handleImageDelete}
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-20 rounded-full"
            aria-label="画像を削除"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <input
          id="thumbnailUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  }
);
ThumbnailUploader.displayName = "ThumbnailUploader";

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
  }: {
    id: string;
    initialName: string;
    isReadOnly: boolean;
    viewCount: number;
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

    return (
      <div className="relative flex flex-col mb-4">
        <div className="text-muted-foreground text-right mb-2">
          <span className="text-sm">{viewCount} views</span>
        </div>

        <div>
          {isReadOnly ? (
            <h1 className="leading-[1.5] tracking-wide text-2xl font-bold">
              {nodeName}
            </h1>
          ) : (
            <textarea
              className="min-w-full max-w-full field-sizing-content resize-none leading-[1.5] border-none tracking-wide text-2xl font-bold bg-transparent focus:outline-none focus:ring-0"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
            />
          )}
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
    <div className="w-[90%] flex flex-col min-h-screen relative max-w-2xl mx-auto">
      <div className="flex-1 flex flex-col pt-20">
        <ThumbnailUploader
          id={id}
          initialImgUrl={node.imageUrl}
          isReadOnly={isReadOnly}
        />

        <NodeNameEditor
          id={id}
          initialName={node.name}
          isReadOnly={isReadOnly}
          viewCount={node.viewCount}
        />

        {!isReadOnly && (
          <TagManager nodeId={id} currentTags={node.tags} allTags={allTags} />
        )}

        <ReactionBar nodeId={id} initialReactions={reactions} />

        <div className="flex-1">
          <NodeEditor
            id={id}
            initialContent={node.content}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
