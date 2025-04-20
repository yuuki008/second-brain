"use client";

import { Node, Tag } from "@prisma/client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
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
            >
              <Link href={`/node/${node.id}`} className="block">
                <h2 className="flex-1 line-clamp-1 mr-4 text-xl mb-2 font-medium group-hover:text-accent transition-colors">
                  {node.name}
                </h2>

                {description && (
                  <p className="text-muted-foreground text-sm mb-3">
                    {description}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ロードモードのための参照ポイント */}
      <div className="mt-8 text-center" ref={loadMoreRef}>
        {nextCursor && (
          <Button
            variant="ghost"
            onClick={loadMoreNodes}
            disabled={loading}
            className="px-8"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                読み込み中...
              </span>
            ) : (
              "もっと読み込む"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
