"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagCreateModal } from "@/app/components/TagManager/TagCreateModal";
import { updateTagHierarchy } from "./actions";
import { Tag } from "@prisma/client";

export interface TagWithChildren extends Tag {
  children: TagWithChildren[];
}

interface TagManagerProps {
  nodeId: string;
  currentTags: TagWithChildren[];
  allTags?: TagWithChildren[];
}

const TagManager: React.FC<TagManagerProps> = ({
  currentTags,
  allTags = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTagCreate = (newTag: Tag) => {
    // 新しいタグが作成された後の処理
    console.log("新しいタグが作成されました:", newTag);
  };

  const handleTagUpdate = async (updatedTags: Tag[]) => {
    try {
      // タグの階層構造を更新
      await updateTagHierarchy(
        updatedTags.map((tag) => ({
          id: tag.id,
          parentId: tag.parentId,
        }))
      );
      console.log("タグの階層が更新されました:", updatedTags);
    } catch (error) {
      console.error("タグの階層更新に失敗しました:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
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

      <TagCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allTags={allTags}
        onTagCreate={handleTagCreate}
        onTagUpdate={handleTagUpdate}
      />
    </div>
  );
};

export default TagManager;
