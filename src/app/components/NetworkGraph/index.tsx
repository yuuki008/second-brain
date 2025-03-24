"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  setupSimulation,
  setupDragBehavior,
  avoidCenter,
  updatePositions,
  updateSimulationForResize,
  fitGraphToView,
  convertLinksToNodeReferences,
  runInitialSimulation,
} from "./helper";
import { cn } from "@/lib/utils";

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
  className?: string;
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

    // コンテナのサイズを取得
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // 既存のSVGをクリア
    d3.select(svgRef.current).selectAll("*").remove();

    // SVGの設定（最初は非表示）
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("opacity", 0); // 初期状態では見えないように設定

    // ズーム用のコンテナを追加
    const zoomContainer = svg.append("g");

    // ズーム動作の設定
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    // SVGにズーム動作を適用
    svg.call(zoom);

    // ダブルクリックでズームリセット
    svg.on("dblclick.zoom", () => {
      fitGraphToView(filteredNodes, width, height, zoom, svg);
    });

    // グラフの設定
    const centerRadius = centerNodeId ? 0 : 150; // 詳細ページでは中心の空白エリアが不要
    const centerX = width / 2;
    const centerY = height / 2;

    // グラフデータの準備
    const nodes: NodeData[] = filteredNodes.map((d) => ({ ...d }));
    const links: LinkData[] = filteredLinks.map((d) => ({ ...d }));

    // ノードマップの作成とリンクの参照変換
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    convertLinksToNodeReferences(links, nodeMap);

    // 中心ノードの検索と設定
    const centerNode = centerNodeId ? nodeMap.get(centerNodeId) || null : null;
    if (centerNode) {
      centerNode.fx = width / 2;
      centerNode.fy = height / 2;
    }

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
      .call(setupDragBehavior(simulation, centerNodeId));

    // ノードの円の描画
    const centralNodeSize = 12;
    const otherNodeSize = 7;

    node
      .append("circle")
      .attr("r", (d) =>
        centerNodeId && d.id === centerNodeId ? centralNodeSize : otherNodeSize
      )
      .attr("class", (d) =>
        cn(
          "transition-all duration-100",
          centerNodeId && d.id === centerNodeId
            ? "fill-blue-300 dark:fill-blue-500"
            : "fill-primary"
        )
      )
      .on("mouseover", function () {
        d3.select(this).attr("r", centralNodeSize);
      })
      .on("mouseout", function (_, d) {
        if (centerNode?.id === d.id) return;

        d3.select(this).attr("r", otherNodeSize);
      })
      .on("click", (event, d) => {
        onNodeSelect(d);
      });

    // ノードのラベルの描画
    node
      .append("text")
      .attr("dx", 0)
      .attr("dy", -17)
      .attr("text-anchor", "middle")
      .attr("class", (d) =>
        centerNodeId && d.id === centerNodeId ? "font-bold text-sm" : "text-xs"
      )
      .attr("fill", "hsl(var(--foreground))")
      .text((d) => d.name);

    // 中心ノードがある場合、シミュレーションを実行して位置を安定させる
    if (centerNode) {
      runInitialSimulation(simulation, 300);
    }

    // シミュレーションの更新関数
    simulation.on("tick", () => {
      // 中心付近を避けるように調整（詳細ページでは適用しない）
      if (!centerNodeId) {
        avoidCenter(nodes, centerNode, centerX, centerY, centerRadius);
      }

      // 要素の位置更新
      updatePositions(link, node);
    });

    // グラフを表示する前に位置を安定させてからフィットさせる
    runInitialSimulation(simulation, centerNode ? 100 : 150);

    // グラフ全体が見えるようにズーム調整し、その後表示
    fitGraphToView(nodes, width, height, zoom, svg);

    // フィットした後にSVGを表示
    svg.transition().duration(300).style("opacity", 1);

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

        fitGraphToView(nodes, newRect.width, newRect.height, zoom, svg);
      }
    };

    window.addEventListener("resize", handleResize);

    // クリーンアップ関数を返す
    return () => {
      window.removeEventListener("resize", handleResize);
      simulation.stop();
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
    <div
      ref={containerRef}
      className={cn("w-full h-full bg-transparent relative")}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkGraph;
