"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// D3.js用の型定義
interface NodeData {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
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

interface NetworkGraphProps {
  graphData: {
    nodes: NodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
  activeTagId: string | null;
  onNodeSelect: (node: NodeData) => void;
  allTagIds?: string[]; // 選択されたタグとその子タグのIDリスト
  centerNodeId?: string; // 中心に配置するノードのID
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  activeTagId,
  onNodeSelect,
  allTagIds,
  centerNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    const centerRadius = centerNodeId ? 0 : 150; // 詳細ページでは中心の空白エリアが不要
    const centerX = width / 2;
    const centerY = height / 2;

    // タグでフィルタリングされたノード
    const filteredNodes = activeTagId
      ? graphData.nodes.filter(
          (node) =>
            node.tags &&
            node.tags.some((tag) =>
              // 選択されたタグIDとその子タグIDのリストを使用してフィルタリング
              allTagIds ? allTagIds.includes(tag.id) : tag.id === activeTagId
            )
        )
      : graphData.nodes;

    // フィルタリングされたノードIDを取得
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // リンクもフィルタリング
    const filteredLinks = activeTagId
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

    // 中心に配置するノードを検索
    const centerNode = centerNodeId
      ? nodes.find((node) => node.id === centerNodeId)
      : null;

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
      .force("collide", d3.forceCollide().radius(40));

    // 詳細ページでは中心から離す力を適用しない
    if (!centerNodeId) {
      simulation.force(
        "centerAvoid",
        d3.forceRadial(centerRadius, centerX, centerY).strength(0.8)
      );
    }

    // リンクの描画
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5);

    // ノードグループの作成
    const node = svg
      .append("g")
      .selectAll<SVGGElement, NodeData>(".node")
      .data(nodes)
      .join("g")
      .attr("class", (d) =>
        centerNodeId && d.id === centerNodeId
          ? "node cursor-pointer font-bold"
          : "node cursor-pointer"
      )
      .call(
        d3
          .drag<SVGGElement, NodeData>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => {
        onNodeSelect(d);
      });

    // ノードの円の描画
    node
      .append("circle")
      .attr("r", (d) => (centerNodeId && d.id === centerNodeId ? 10 : 7))
      .attr("fill", (d) =>
        centerNodeId && d.id === centerNodeId
          ? "hsl(var(--primary))"
          : "hsl(var(--foreground))"
      );

    // ノードのラベルの描画
    node
      .append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .attr("class", (d) =>
        centerNodeId && d.id === centerNodeId ? "font-bold text-sm" : "text-xs"
      )
      .attr("fill", "hsl(var(--foreground))")
      .text((d) => d.name);

    // 中心ノードがある場合、その位置を固定
    if (centerNode) {
      centerNode.fx = width / 2;
      centerNode.fy = height / 2;

      // シミュレーションを一定回数実行して関連ノードを中心の周りに配置
      simulation.alpha(1).restart();
      for (let i = 0; i < 300; i++) {
        simulation.tick();
      }
    }

    // シミュレーションの更新関数
    simulation.on("tick", () => {
      // 中心付近を避けるように調整（詳細ページでは適用しない）
      if (!centerNodeId) {
        nodes.forEach((d) => {
          if (d !== centerNode) {
            // 中心ノードでない場合のみ適用
            const dx = (d.x || 0) - centerX;
            const dy = (d.y || 0) - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < centerRadius) {
              const scale = centerRadius / distance;
              d.x = centerX + dx * scale;
              d.y = centerY + dy * scale;
            }
          }
        });
      }

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
      // 中心ノードの場合は位置を固定したまま
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = d.x;
        d.fy = d.y;
      }
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, NodeData, unknown>,
      d: NodeData
    ) {
      // 中心ノードの場合は位置を固定したまま
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = event.x;
        d.fy = event.y;
      }
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, NodeData, unknown>,
      d: NodeData
    ) {
      if (!event.active) simulation.alphaTarget(0);
      // 中心ノードの場合は位置を固定したまま
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = null;
        d.fy = null;
      }
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
        if (!centerNodeId) {
          simulation.force(
            "centerAvoid",
            d3
              .forceRadial(centerRadius, newRect.width / 2, newRect.height / 2)
              .strength(0.8)
          );
        }
        simulation.alpha(0.3).restart();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [graphData, activeTagId, allTagIds, onNodeSelect, centerNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full bg-background">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkGraph;
