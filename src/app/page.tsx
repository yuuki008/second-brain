"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Term } from "@prisma/client";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
}

// D3.jsの型拡張
declare module "d3" {
  interface SimulationNodeDatum {
    id?: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  }
}

const TopPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<
    (Term & { tags: string[] }) | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showTagList, setShowTagList] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // サンプルデータの拡張版（タグ付き）
  const graphData = useMemo(
    () => ({
      nodes: [
        // プログラミング関連
        {
          id: "1",
          name: "React",
          tags: ["フロントエンド", "ライブラリ", "UI"],
        },
        {
          id: "2",
          name: "Next.js",
          tags: ["フロントエンド", "フレームワーク", "React"],
        },
        {
          id: "3",
          name: "Tailwind CSS",
          tags: ["フロントエンド", "CSS", "スタイリング"],
        },
        {
          id: "4",
          name: "TypeScript",
          tags: ["言語", "型システム", "JavaScript"],
        },
        {
          id: "5",
          name: "GraphQL",
          tags: ["API", "クエリ言語", "データ取得"],
        },
        {
          id: "6",
          name: "RESTful API",
          tags: ["API", "バックエンド", "アーキテクチャ"],
        },
        {
          id: "7",
          name: "Redux",
          tags: ["フロントエンド", "状態管理", "React"],
        },
        {
          id: "8",
          name: "React Hooks",
          tags: ["フロントエンド", "React", "関数コンポーネント"],
        },

        // データベース関連
        {
          id: "10",
          name: "PostgreSQL",
          tags: ["データベース", "SQL", "RDBMS"],
        },
        {
          id: "11",
          name: "MongoDB",
          tags: ["データベース", "NoSQL", "ドキュメント指向"],
        },
        {
          id: "12",
          name: "Prisma",
          tags: ["ORM", "データベース", "TypeScript"],
        },
        {
          id: "13",
          name: "Supabase",
          tags: ["データベース", "BaaS", "Firebase代替"],
        },
        {
          id: "14",
          name: "SQL",
          tags: ["クエリ言語", "データベース", "RDBMS"],
        },
        {
          id: "15",
          name: "NoSQL",
          tags: ["データベース", "非リレーショナル", "スケーラビリティ"],
        },
        {
          id: "16",
          name: "Firebase",
          tags: ["データベース", "BaaS", "Google"],
        },

        // インフラ関連
        {
          id: "20",
          name: "Docker",
          tags: ["コンテナ", "インフラ", "開発環境"],
        },
        {
          id: "21",
          name: "Kubernetes",
          tags: ["コンテナオーケストレーション", "インフラ", "クラウド"],
        },
        {
          id: "22",
          name: "AWS",
          tags: ["クラウド", "インフラ", "サービス"],
        },
        {
          id: "23",
          name: "Vercel",
          tags: ["デプロイ", "ホスティング", "Next.js"],
        },
        {
          id: "24",
          name: "CI/CD",
          tags: ["自動化", "デプロイ", "インフラ"],
        },
        {
          id: "25",
          name: "Microservices",
          tags: ["アーキテクチャ", "スケーラビリティ", "分散システム"],
        },

        // 用語関連
        {
          id: "30",
          name: "SPA",
          tags: ["アーキテクチャ", "フロントエンド", "React"],
        },
        {
          id: "31",
          name: "SSR",
          tags: ["レンダリング", "Next.js", "パフォーマンス"],
        },
        {
          id: "32",
          name: "SSG",
          tags: ["レンダリング", "Next.js", "パフォーマンス"],
        },
        {
          id: "33",
          name: "ISR",
          tags: ["レンダリング", "Next.js", "パフォーマンス"],
        },
        {
          id: "34",
          name: "JWT",
          tags: ["認証", "セキュリティ", "トークン"],
        },
        {
          id: "35",
          name: "OAuth",
          tags: ["認証", "セキュリティ", "認可"],
        },

        // 方法論
        {
          id: "40",
          name: "Agile",
          tags: ["プロジェクト管理", "開発手法", "チーム"],
        },
        {
          id: "41",
          name: "Scrum",
          tags: ["プロジェクト管理", "Agile", "スプリント"],
        },
        {
          id: "42",
          name: "TDD",
          tags: ["テスト", "開発手法", "品質"],
        },
        {
          id: "43",
          name: "DDD",
          tags: ["設計", "アーキテクチャ", "モデリング"],
        },
        {
          id: "44",
          name: "DevOps",
          tags: ["組織文化", "自動化", "CI/CD"],
        },
      ],
      links: [
        // React関連
        { source: "1", target: "2" },
        { source: "1", target: "3" },
        { source: "1", target: "4" },
        { source: "1", target: "7" },
        { source: "1", target: "8" },
        { source: "2", target: "5" },

        // Next.js関連
        { source: "2", target: "31" },
        { source: "2", target: "32" },
        { source: "2", target: "33" },

        // データベース関連
        { source: "10", target: "14" },
        { source: "11", target: "15" },
        { source: "12", target: "10" },
        { source: "13", target: "10" },
        { source: "15", target: "11" },
        { source: "16", target: "15" },

        // インフラ関連
        { source: "20", target: "21" },
        { source: "21", target: "22" },
        { source: "20", target: "22" },
        { source: "23", target: "2" },
        { source: "24", target: "20" },
        { source: "24", target: "44" },
        { source: "25", target: "21" },

        // アーキテクチャ関連
        { source: "25", target: "43" },
        { source: "30", target: "1" },
        { source: "31", target: "2" },
        { source: "32", target: "2" },
        { source: "33", target: "2" },

        // 方法論関連
        { source: "40", target: "41" },
        { source: "41", target: "44" },
        { source: "42", target: "40" },
        { source: "43", target: "42" },
      ],
    }),
    []
  );

  // 全てのタグをリストアップ
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    graphData.nodes.forEach((node) => {
      if (node.tags) {
        node.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [graphData]);

  // D3.jsを使ったネットワークグラフの初期化
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // コンテナのサイズを取得
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // 既存のSVGをクリア
    d3.select(svgRef.current).selectAll("*").remove();

    // SVGの設定
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    // 中央に空白領域を作成（検索フォーム用）
    const centerRadius = 150; // 中心の空白エリアの半径
    const centerX = width / 2;
    const centerY = height / 2;

    // ノードの色を決定する関数を削除し、固定の色を使用

    // タグでフィルタリングされたノード
    const filteredNodes = activeTag
      ? graphData.nodes.filter(
          (node) => node.tags && node.tags.includes(activeTag)
        )
      : graphData.nodes;

    // フィルタリングされたノードIDを取得
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // リンクもフィルタリング
    const filteredLinks = activeTag
      ? graphData.links.filter(
          (link) =>
            filteredNodeIds.has(
              typeof link.source === "string"
                ? link.source
                : (link.source as NodeData).id
            ) &&
            filteredNodeIds.has(
              typeof link.target === "string"
                ? link.target
                : (link.target as NodeData).id
            )
        )
      : graphData.links;

    // グラフデータを整形（文字列IDをオブジェクト参照に）
    const links: LinkData[] = filteredLinks.map((d) => ({ ...d }));
    const nodes: NodeData[] = filteredNodes.map((d) => ({ ...d }));

    // リンクのIDをオブジェクト参照に変換
    links.forEach((link) => {
      if (typeof link.source === "string") {
        const sourceNode = nodes.find((node) => node.id === link.source);
        if (sourceNode) {
          link.source = sourceNode;
        }
      }
      if (typeof link.target === "string") {
        const targetNode = nodes.find((node) => node.id === link.target);
        if (targetNode) {
          link.target = targetNode;
        }
      }
    });

    // フォースシミュレーションの設定
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
          .id((d: d3.SimulationNodeDatum) => d.id as string)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40))
      // 中心から離す力を追加
      .force(
        "centerAvoid",
        d3.forceRadial(centerRadius, centerX, centerY).strength(0.8)
      );

    // リンクの描画
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 1.5);

    // ノードグループの作成
    const node = svg
      .append("g")
      .selectAll<SVGGElement, NodeData>(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, NodeData>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => {
        handleTermSelect(d);
      });

    // ノードの円の描画
    node.append("circle").attr("r", 7).attr("fill", "#9CA3AF"); // グレーの色に統一

    // ノードのラベルの描画
    node
      .append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("fill", "#4b5563")
      .attr("font-weight", "500")
      .text((d) => d.name);

    // シミュレーションの更新関数
    simulation.on("tick", () => {
      // 中心付近を避けるように調整
      nodes.forEach((d) => {
        const dx = (d.x || 0) - centerX;
        const dy = (d.y || 0) - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < centerRadius) {
          const scale = centerRadius / distance;
          d.x = centerX + dx * scale;
          d.y = centerY + dy * scale;
        }
      });

      link
        .attr("x1", (d) => (d.source as NodeData).x || 0)
        .attr("y1", (d) => (d.source as NodeData).y || 0)
        .attr("x2", (d) => (d.target as NodeData).x || 0)
        .attr("y2", (d) => (d.target as NodeData).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // ドラッグ関連の関数
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, NodeData, unknown>,
      d: NodeData
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, NodeData, unknown>,
      d: NodeData
    ) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, NodeData, unknown>,
      d: NodeData
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // ウィンドウリサイズに対応
    const handleResize = () => {
      if (containerRef.current) {
        const newRect = containerRef.current.getBoundingClientRect();
        simulation.force(
          "center",
          d3.forceCenter(newRect.width / 2, newRect.height / 2)
        );
        // 中心を避ける力も更新
        simulation.force(
          "centerAvoid",
          d3
            .forceRadial(centerRadius, newRect.width / 2, newRect.height / 2)
            .strength(0.8)
        );
        simulation.alpha(0.3).restart();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTag, graphData]);

  // 検索結果のフィルタリング
  const filteredTerms = searchQuery
    ? graphData.nodes.filter((node) => {
        // 用語名での検索
        const nameMatch = node.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        // タグでの検索
        const tagMatch =
          node.tags &&
          node.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return nameMatch || tagMatch;
      })
    : [];

  // 検索キーを押した時の処理を追加
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enterキーが押されて、検索クエリがあり、検索結果がない場合
    if (e.key === "Enter" && searchQuery && filteredTerms.length === 0) {
      handleCreateTerm();
    }
  };

  // 用語選択時の処理
  const handleTermSelect = (term: NodeData) => {
    setSelectedTerm({
      id: term.id,
      name: term.name,
      definition: `これは${term.name}の定義です。これは例として、<span class="text-blue-600 cursor-pointer underline">Next.js</span>や<span class="text-blue-600 cursor-pointer underline">Tailwind CSS</span>などの関連用語へのリンクを含んでいます。`,
      createdAt: new Date("2025-03-01"),
      updatedAt: new Date("2025-03-20"),
      tags: term.tags || [],
    });
    setShowTermModal(true);
    setSearchQuery("");
  };

  // 新規用語作成モーダルを表示
  const handleCreateTerm = () => {
    setShowCreateModal(true);
    setShowTermModal(false);
  };

  // タグ選択時の処理
  const handleTagSelect = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
    setSearchQuery("");
  };

  // 検索結果をクリックしたときの処理
  const handleSearchResultClick = (term: NodeData) => {
    handleTermSelect(term);
    setSearchQuery("");
  };

  // 検索結果表示部分
  const renderSearchResults = () => {
    if (!searchQuery || filteredTerms.length === 0) return <></>;

    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-20 overflow-hidden">
        <ScrollArea className="max-h-60">
          <div className="divide-y">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSearchResultClick(term)}
              >
                <div className="font-medium">{term.name}</div>
                {term.tags && term.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {term.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    );
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
      {/* 全画面ネットワークグラフ */}
      <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      {/* タグフィルターアイコン */}
      <div className="absolute top-4 left-4 z-10">
        <Popover open={showTagList} onOpenChange={setShowTagList}>
          <PopoverTrigger asChild>
            <Button
              variant={activeTag ? "default" : "outline"}
              size="icon"
              className="rounded-full h-10 w-10 relative"
            >
              <Tag className="h-5 w-5" />
              {activeTag && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium">タグでフィルター</h3>
            </div>
            <ScrollArea className="h-64">
              <div className="p-3 flex flex-wrap gap-2">
                {allTags.map((tag: string) => (
                  <Badge
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    variant={activeTag === tag ? "default" : "secondary"}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* 中央検索フォーム */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-4">
        <div className="relative">
          <div className="flex relative items-center">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="用語を検索..."
              className="pl-10 pr-5 py-6 rounded-full shadow-md bg-white border-none"
            />
          </div>

          {/* 検索結果ドロップダウン */}
          {renderSearchResults()}
        </div>
      </div>

      {/* 用語詳細モーダル */}
      <Dialog open={showTermModal} onOpenChange={setShowTermModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTerm?.name}</DialogTitle>
            {selectedTerm?.tags && selectedTerm.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTerm.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: selectedTerm?.definition || "",
            }}
          />

          <DialogFooter>
            <Button variant="outline">編集</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規用語作成モーダル */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規用語の作成</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                用語名
              </label>
              <Input defaultValue={searchQuery} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                タグ
              </label>
              <Input placeholder="カンマ区切りで入力（例: フロントエンド, React, UI）" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                定義/説明
              </label>
              <Textarea
                className="h-32"
                placeholder="マークダウン形式で入力できます..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              キャンセル
            </Button>
            <Button>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopPage;
