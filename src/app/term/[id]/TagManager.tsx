"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SelectTagModal } from "@/app/components/TagManager/SelectTagModal";
import { getAllTags, addTagToNode, removeTagFromNode } from "./actions";
import { Tag } from "@prisma/client";

export interface TagWithChildren extends Tag {
  children: TagWithChildren[];
}

interface TagManagerProps {
  nodeId: string;
  currentTags: Tag[];
}

const TagManager: React.FC<TagManagerProps> = ({ nodeId, currentTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allTags, setAllTags] = useState<TagWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 全タグを取得
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const result = await getAllTags();
        if (result.success) {
          setAllTags(result.tags);
        }
      } catch (error) {
        console.error("タグの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagSelect = async (selectedTagIds: string[]) => {
    try {
      // 追加されたタグ（選択されているが、現在のタグにないもの）
      for (const tagId of selectedTagIds) {
        if (!currentTags.some((t) => t.id === tagId)) {
          await addTagToNode(nodeId, tagId);
        }
      }

      // 削除されたタグ（現在のタグにあるが、選択されていないもの）
      for (const tag of currentTags) {
        if (!selectedTagIds.includes(tag.id)) {
          await removeTagFromNode(nodeId, tag.id);
        }
      }
    } catch (error) {
      console.error("タグの更新に失敗しました:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          タグを管理
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${tag.color}20` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span>{tag.name}</span>
          </div>
        ))}
      </div>

      <SelectTagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allTags={allTags}
        currentTags={currentTags}
        onTagSelect={handleTagSelect}
      />
    </div>
  );
};

export default TagManager;
