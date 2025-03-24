"use client";

import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { removeTagFromNode, addTagToNode, getAllTags } from "./actions";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  nodeId: string;
  currentTags: Tag[];
}

export default function TagManager({ nodeId, currentTags }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 現在のタグからIDの集合を作成
  const currentTagIds = new Set(currentTags.map((tag) => tag.id));

  // ダイアログを開くときに全タグを取得
  useEffect(() => {
    if (isOpen) {
      const fetchTags = async () => {
        setIsLoading(true);
        try {
          const result = await getAllTags();
          if (result.success) {
            setAvailableTags(result.tags);

            // 現在選択されているタグをセット
            const selected = new Set<string>();
            result.tags.forEach((tag) => {
              if (currentTagIds.has(tag.id)) {
                selected.add(tag.id);
              }
            });
            setSelectedTags(selected);
          }
        } catch (error) {
          console.error("タグの取得に失敗しました:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTags();
    }
  }, [isOpen, currentTagIds]);

  // タグを削除する
  const handleRemoveTag = async (tagId: string) => {
    try {
      await removeTagFromNode(nodeId, tagId);
    } catch (error) {
      console.error("タグの削除に失敗しました:", error);
    }
  };

  // タグの選択状態を切り替える
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // 選択されたタグを保存
  const saveSelectedTags = async () => {
    setIsLoading(true);
    try {
      // 追加されたタグ（選択されているが、現在のタグにないもの）
      for (const tagId of selectedTags) {
        if (!currentTagIds.has(tagId)) {
          await addTagToNode(nodeId, tagId);
        }
      }

      // 削除されたタグ（現在のタグにあるが、選択されていないもの）
      for (const tagId of currentTagIds) {
        if (!selectedTags.has(tagId)) {
          await removeTagFromNode(nodeId, tagId);
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error("タグの更新に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* 現在のタグ表示 */}
      <div className="flex flex-wrap gap-4 mb-4">
        {currentTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="bg-muted relative flex items-center"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="absolute p-[3px] right-[-10px] top-[-10px] h-auto rounded-full border bg-muted hover:bg-muted-foreground/20"
              aria-label={`${tag.name}タグを削除`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              タグを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>タグを管理</DialogTitle>
              <DialogDescription>
                用語に関連するタグを選択してください
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isLoading ? (
                <div className="text-center">読み込み中...</div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto grid grid-cols-2 gap-2">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.has(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={saveSelectedTags} disabled={isLoading}>
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
