"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  setupSimulation,
  setupDragBehavior,
  avoidCenter,
  updatePositions,
  updateSimulationForResize,
} from "./helper";

// D3.js用の型定義
export interface NodeData {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkData {
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

export interface NetworkGraphProps {
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

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  activeTagId,
  onNodeSelect,
  allTagIds,
  centerNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // フィルタリングされたノードとリンクのメモ化
  const { filteredNodes, filteredLinks } = useMemo(() => {
    // タグでフィルタリングされたノード
    const nodes = activeTagId
      ? graphData.nodes.filter(
          (node) =>
            node.tags &&
            node.tags.some((tag) =>
              allTagIds ? allTagIds.includes(tag.id) : tag.id === activeTagId
            )
        )
      : graphData.nodes;

    // フィルタリングされたノードIDのセット
    const nodeIds = new Set(nodes.map((node) => node.id));

    // リンクもフィルタリング
    const links = activeTagId
      ? graphData.links.filter(
          (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
        )
      : graphData.links;

    return { filteredNodes: nodes, filteredLinks: links };
  }, [graphData, activeTagId, allTagIds]);

  // D3.jsを使ったネットワークグラフの初期化
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // クリーンアップ関数
    const cleanupFunctions: (() => void)[] = [];

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
      .attr("width", width)
      .attr("height", height);

    // ズーム用のコンテナを追加
    const zoomContainer = svg.append("g");

    // ズーム動作の設定
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    // zoomRefを保存（後でプログラムからズームコントロールするため）
    zoomRef.current = zoom;

    // SVGにズーム動作を適用
    svg.call(zoom);

    // ダブルクリックでズームリセット（使いやすさ向上）
    svg.on("dblclick.zoom", () => {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
    });

    // 中央に空白領域を作成（検索フォーム用）
    const centerRadius = centerNodeId ? 0 : 150; // 詳細ページでは中心の空白エリアが不要
    const centerX = width / 2;
    const centerY = height / 2;

    // グラフデータの準備
    const nodes: NodeData[] = filteredNodes.map((d) => ({ ...d }));
    const links: LinkData[] = filteredLinks.map((d) => ({ ...d }));

    // 中心に配置するノードを検索
    const centerNode = centerNodeId
      ? nodes.find((node) => node.id === centerNodeId)
      : null;

    // リンクのIDをオブジェクト参照に変換
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    links.forEach((link) => {
      if (typeof link.source === "string") {
        const sourceNode = nodeMap.get(link.source);
        if (sourceNode) link.source = sourceNode;
      }
      if (typeof link.target === "string") {
        const targetNode = nodeMap.get(link.target);
        if (targetNode) link.target = targetNode;
      }
    });

    // フォースシミュレーションの設定
    const simulation = setupSimulation(
      nodes,
      links,
      width,
      height,
      centerRadius,
      centerX,
      centerY,
      centerNodeId
    );

    // リンクの描画
    const link = zoomContainer
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1.5);

    // ノードグループの作成
    const node = zoomContainer
      .append("g")
      .selectAll<SVGGElement, NodeData>(".node")
      .data(nodes)
      .join("g")
      .attr("class", (d) =>
        centerNodeId && d.id === centerNodeId
          ? "node cursor-pointer font-bold"
          : "node cursor-pointer"
      )
      .call(setupDragBehavior(simulation, centerNodeId))
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
        avoidCenter(nodes, centerNode || null, centerX, centerY, centerRadius);
      }

      // 要素の位置更新
      updatePositions(link, node);
    });

    // ウィンドウリサイズに対応
    const handleResize = () => {
      if (containerRef.current) {
        const newRect = containerRef.current.getBoundingClientRect();
        updateSimulationForResize(
          simulation,
          newRect,
          centerRadius,
          centerNodeId
        );
      }
    };

    window.addEventListener("resize", handleResize);
    cleanupFunctions.push(() =>
      window.removeEventListener("resize", handleResize)
    );

    // クリーンアップ関数を返す
    return () => {
      cleanupFunctions.forEach((fn) => fn());
    };
  }, [
    filteredNodes,
    filteredLinks,
    activeTagId,
    allTagIds,
    onNodeSelect,
    centerNodeId,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full bg-background relative">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkGraph;
