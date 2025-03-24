"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  setupSimulation,
  filterGraphData,
  initializeGraph,
  prepareGraphData,
  drawGraphElements,
  runInitialSimulation,
  fitGraphToView,
  setupSimulationTick,
  createResizeHandler,
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
  allTagIds?: string[];
  centerNodeId?: string;
  className?: string;
}

// 型のヘルパー
export type D3CircleSelection = d3.Selection<
  SVGCircleElement,
  NodeData,
  null,
  undefined
>;

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
    return filterGraphData(graphData, activeTagId, allTagIds);
  }, [graphData, activeTagId, allTagIds]);

  // D3.jsを使ったネットワークグラフの初期化
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // 初期設定
    const {
      width,
      height,
      svg,
      zoomContainer,
      zoom,
      centerRadius,
      centerX,
      centerY,
    } = initializeGraph(svgRef.current, containerRef.current);

    // グラフデータの準備
    const { nodes, links, centerNode } = prepareGraphData(
      filteredNodes,
      filteredLinks,
      centerNodeId,
      width,
      height
    );

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

    // リンクとノードの描画
    const { link, node } = drawGraphElements(
      zoomContainer,
      links,
      nodes,
      simulation,
      centerNodeId,
      onNodeSelect
    );

    // 中心ノードがある場合、シミュレーションを実行して位置を安定させる
    if (centerNode) {
      runInitialSimulation(simulation, 300);
    }

    // シミュレーションの更新関数
    setupSimulationTick(
      simulation,
      nodes,
      centerNode,
      centerNodeId,
      centerX,
      centerY,
      centerRadius,
      link,
      node
    );

    // グラフを表示する前に位置を安定させてからフィットさせる
    runInitialSimulation(simulation, 250);

    // グラフ全体が見えるようにズーム調整し、その後表示
    fitGraphToView(nodes, width, height, zoom, svg);

    // フィットした後にSVGを表示
    svg.transition().duration(800).style("opacity", 1);

    // ウィンドウリサイズに対応
    const handleResize = createResizeHandler(
      containerRef,
      simulation,
      centerRadius,
      centerNodeId,
      nodes,
      zoom,
      svg
    );

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

export default React.memo(NetworkGraph);
