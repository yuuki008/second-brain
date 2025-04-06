"use client";

import { Node, Tag } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaginatedNodes } from "@/app/actions/search";

interface PostsListProps {
  initialNodes: (Node & { tags: Tag[] })[];
  nextCursor?: string;
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

export default function PostsList({
  initialNodes,
  nextCursor: initialNextCursor,
}: PostsListProps) {
  const [nodes, setNodes] = useState<(Node & { tags: Tag[] })[]>(initialNodes);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    initialNextCursor
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 追加のノードを読み込む関数
  const loadMoreNodes = useCallback(async () => {
    if (!nextCursor || loading) return;

    try {
      setLoading(true);

      // 読み込み状態が表示されるように少し遅延を入れる
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await getPaginatedNodes(15, nextCursor);
      setNodes((prev) => [...prev, ...result.nodes]);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("ノードの読み込みに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [nextCursor, loading]);

  // インターセクションオブザーバーを使用して、ユーザーがページの最下部に近づいたらノードを自動的に読み込む
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loading) {
          loadMoreNodes();
        }
      },
      {
        threshold: 0.5,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [nextCursor, loading, loadMoreNodes]);

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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    <time dateTime={node.updatedAt.toISOString()}>
                      {format(node.updatedAt, "yyyy年MM月dd日")}
                    </time>
                  </div>
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

      <div className="mt-8 text-center">
        {nextCursor && (
          <Button
            variant="outline"
            onClick={loadMoreNodes}
            disabled={loading}
            className="px-8"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </Button>
        )}

        {/* ロードモードのための参照ポイント */}
        <div className="mt-30 w-0 h-0" ref={loadMoreRef} />
      </div>
    </div>
  );
}
