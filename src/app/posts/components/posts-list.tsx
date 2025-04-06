"use client";

import { Node, Tag } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface PostsListProps {
  nodes: (Node & { tags: Tag[] })[];
}

// HTMLタグを除去する関数
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// 説明文を生成する関数（タグを除去して最初の150文字を抽出）
function getDescription(content: string): string {
  const plainText = stripTags(content);
  return plainText.length > 150
    ? plainText.substring(0, 150) + "..."
    : plainText;
}

export default function PostsList({ nodes }: PostsListProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return (
    <div className="relative">
      <ul className="space-y-6">
        {nodes.map((node) => {
          const description = getDescription(node.content);

          return (
            <li
              key={node.id}
              className="group relative rounded-lg border p-4 transition-all hover:bg-accent/5"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <Link href={`/node/${node.id}`} className="block">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="flex-1 line-clamp-1 mr-4 text-xl font-medium group-hover:text-accent transition-colors">
                    {node.name}
                  </h2>
                </div>

                {description && (
                  <p className="text-muted-foreground text-sm mb-3">
                    {description}
                  </p>
                )}
              </Link>

              {/* サムネイル画像（ホバー時に表示） */}
              {hoveredNodeId === node.id && node.imageUrl && (
                <div className="absolute top-0 -right-60 w-56 h-40 overflow-hidden rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Image
                    src={node.imageUrl}
                    alt={node.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
