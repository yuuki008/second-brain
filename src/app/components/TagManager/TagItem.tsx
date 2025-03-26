"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@prisma/client";

interface TagItemProps {
  tag: Tag & { children: Tag[] };
  isDragging?: boolean;
}

export const TagItem: React.FC<TagItemProps> = ({ tag, isDragging }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg cursor-move",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isDragging && "opacity-50"
      )}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <span className="text-sm">{tag.name}</span>
    </div>
  );
};
