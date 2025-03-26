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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTag } from "@/app/term/[id]/actions";
import { Tag } from "@prisma/client";
import { TagItem } from "./TagItem";
import { SortableTagItem } from "./SortableTagItem";
import { TagWithChildren } from "@/app/term/[id]/TagManager";

interface TagCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: TagWithChildren[];
  onTagCreate: (newTag: Tag) => void;
  onTagUpdate: (updatedTags: Tag[]) => void;
}

export const TagCreateModal: React.FC<TagCreateModalProps> = ({
  isOpen,
  onClose,
  allTags,
  onTagCreate,
  onTagUpdate,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tags, setTags] = useState<TagWithChildren[]>(allTags);

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
    onTagUpdate(updatedTags);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag(newTagName);
      const tagWithChildren: TagWithChildren = {
        ...newTag,
        children: [],
      };

      setTags([...tags, tagWithChildren]);
      onTagCreate(tagWithChildren);
      setNewTagName("");
    } catch (error) {
      console.error("タグの作成に失敗しました:", error);
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
          <DialogTitle>タグの管理</DialogTitle>
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
                  <SortableTagItem key={tag.id} tag={tag} />
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
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="新しいタグの名前"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateTag();
                }
              }}
            />
            <Button onClick={handleCreateTag}>作成</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
