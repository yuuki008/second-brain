"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

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

interface NetworkGraphProps {
  graphData: {
    nodes: NodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
  activeTag: string | null;
  onNodeSelect: (node: NodeData) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  activeTag,
  onNodeSelect,
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
    const centerRadius = 150; // 中心の空白エリアの半径
    const centerX = width / 2;
    const centerY = height / 2;

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
      .attr("class", "node cursor-pointer")
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
  }, [activeTag, graphData, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default NetworkGraph;
