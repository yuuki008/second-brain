"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TagWithChildren } from "@/app/term/[id]/TagManager";

interface SortableTagItemProps {
  tag: TagWithChildren;
}

export const SortableTagItem: React.FC<SortableTagItemProps> = ({ tag }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="text-sm">{tag.name}</div>
      {tag.children.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {tag.children.map((child) => (
            <SortableTagItem key={child.id} tag={child} />
          ))}
        </div>
      )}
    </div>
  );
};
