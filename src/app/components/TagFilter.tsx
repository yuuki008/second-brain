"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export interface HierarchicalTag {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  children?: HierarchicalTag[];
}

interface TagFilterComponentProps {
  tags: HierarchicalTag[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

const TagFilter: React.FC<TagFilterComponentProps> = ({
  tags,
  selectedTagIds,
  onTagToggle,
}) => {
  return (
    <div className="fixed top-4 left-4 z-10">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            variant={selectedTagIds.includes(tag.id) ? "default" : "secondary"}
            className="cursor-pointer py-1 hover:opacity-80 transition-opacity"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
