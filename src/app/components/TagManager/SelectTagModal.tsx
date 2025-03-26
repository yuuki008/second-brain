"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTagItem } from "./SortableTagItem";
import { TagItem } from "./TagItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagWithChildren } from "@/app/term/[id]/TagManager";
import { Tag } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTag } from "@/app/term/[id]/actions";

interface SelectTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: TagWithChildren[];
  currentTags: Tag[];
  onTagSelect: (selectedTagIds: string[]) => void;
}

export const SelectTagModal: React.FC<SelectTagModalProps> = ({
  isOpen,
  onClose,
  allTags,
  currentTags,
  onTagSelect,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tags, setTags] = useState<TagWithChildren[]>(allTags);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(currentTags.map((tag) => tag.id))
  );
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTag = findTagById(tags, active.id as string);
    const overTag = findTagById(tags, over.id as string);

    if (!activeTag || !overTag) return;

    // 同じタグの場合は何もしない
    if (activeTag.id === overTag.id) return;

    // 親子関係を更新
    const updatedTags = updateTagHierarchy(tags, activeTag.id, overTag.id);
    setTags(updatedTags);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      // タグの選択状態が変更されたら、親コンポーネントに通知
      onTagSelect(Array.from(newSet));
      return newSet;
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      const result = await createTag(newTagName.trim());
      if (result.success && result.tag) {
        // 新しいタグをリストに追加
        const newTag: TagWithChildren = {
          ...result.tag,
          children: [],
        };
        setTags((prev) => [...prev, newTag]);
        setNewTagName("");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateTag();
    }
  };

  const findTagById = (
    tags: TagWithChildren[],
    id: string
  ): TagWithChildren | null => {
    for (const tag of tags) {
      if (tag.id === id) return tag;
      const found = findTagById(tag.children, id);
      if (found) return found;
    }
    return null;
  };

  const updateTagHierarchy = (
    tags: TagWithChildren[],
    activeId: string,
    overId: string
  ): TagWithChildren[] => {
    const newTags = [...tags];

    // アクティブなタグを探す
    const findAndRemoveTag = (
      tags: TagWithChildren[]
    ): TagWithChildren | null => {
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].id === activeId) {
          return tags.splice(i, 1)[0];
        }
        const found = findAndRemoveTag(tags[i].children);
        if (found) return found;
      }
      return null;
    };

    // 移動先のタグを探す
    const findAndInsertTag = (
      tags: TagWithChildren[],
      targetId: string,
      tagToInsert: TagWithChildren
    ) => {
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].id === targetId) {
          tags[i].children.push(tagToInsert);
          return true;
        }
        if (findAndInsertTag(tags[i].children, targetId, tagToInsert)) {
          return true;
        }
      }
      return false;
    };

    const activeTag = findAndRemoveTag(newTags);
    if (!activeTag) return tags;

    // ルートレベルに追加
    if (!findAndInsertTag(newTags, overId, activeTag)) {
      newTags.push(activeTag);
    }

    return newTags;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>タグを選択</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* タグ一覧 */}
          <div className="border rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tags.map((tag) => tag.id)}
                strategy={verticalListSortingStrategy}
              >
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
                      selectedTags.has(tag.id)
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <SortableTagItem tag={tag} />
                  </div>
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <TagItem
                    tag={findTagById(tags, activeId) || tags[0]}
                    isDragging
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* タグ作成フォーム */}
          <div className="flex gap-2">
            <Input
              placeholder="新しいタグを作成"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
            />
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isCreating}
            >
              {isCreating ? "作成中..." : "作成"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
