import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOrCreateVisitorId } from "@/lib/visitor-id";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useState } from "react";
import { getVisitorReactions, toggleReaction } from "../actions";
import { SmilePlus } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { cn } from "@/lib/utils";

interface EmojiCount {
  emoji: string;
  count: number;
}

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

export default ReactionBar;
