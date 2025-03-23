"use client";

import React, { useEffect, useRef, useMemo } from "react";
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
      .attr("width", "100%")
      .attr("height", "100%");

    // ズーム用のコンテナを追加
    const zoomContainer = svg.append("g").attr("class", "zoom-container");

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

  // ズームコントロール用の関数を公開
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-background relative">
      <svg ref={svgRef} className="w-full h-full" />

      {/* ズームコントロール UI */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-background border border-border rounded-md hover:bg-muted"
          aria-label="ズームイン"
        >
          <PlusIcon />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-background border border-border rounded-md hover:bg-muted"
          aria-label="ズームアウト"
        >
          <MinusIcon />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-background border border-border rounded-md hover:bg-muted"
          aria-label="ズームリセット"
        >
          <ResetIcon />
        </button>
      </div>
    </div>
  );
};

// ヘルパー関数群
function setupSimulation(
  nodes: NodeData[],
  links: LinkData[],
  width: number,
  height: number,
  centerRadius: number,
  centerX: number,
  centerY: number,
  centerNodeId?: string
) {
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

  // 詳細ページでない場合は中心から離す力を適用
  if (!centerNodeId) {
    simulation.force(
      "centerAvoid",
      d3.forceRadial(centerRadius, centerX, centerY).strength(0.8)
    );
  }

  return simulation;
}

function setupDragBehavior(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  centerNodeId?: string
) {
  return d3
    .drag<SVGGElement, NodeData>()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = d.x;
        d.fy = d.y;
      }
    })
    .on("drag", (event, d) => {
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = event.x;
        d.fy = event.y;
      }
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      if (!(centerNodeId && d.id === centerNodeId)) {
        d.fx = null;
        d.fy = null;
      }
    });
}

function avoidCenter(
  nodes: NodeData[],
  centerNode: NodeData | null,
  centerX: number,
  centerY: number,
  centerRadius: number
) {
  nodes.forEach((d) => {
    if (d !== centerNode) {
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

function updatePositions(
  link: d3.Selection<d3.BaseType, LinkData, SVGGElement, unknown>,
  node: d3.Selection<SVGGElement, NodeData, SVGGElement, unknown>
) {
  link
    .attr("x1", (d) => (d.source as NodeData).x || 0)
    .attr("y1", (d) => (d.source as NodeData).y || 0)
    .attr("x2", (d) => (d.target as NodeData).x || 0)
    .attr("y2", (d) => (d.target as NodeData).y || 0);

  node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
}

function updateSimulationForResize(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  newRect: DOMRect,
  centerRadius: number,
  centerNodeId?: string
) {
  simulation.force(
    "center",
    d3.forceCenter(newRect.width / 2, newRect.height / 2)
  );

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

// シンプルなアイコンコンポーネント
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 4V12M4 8H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ResetIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13C6.17746 13 4.58013 12.0599 3.7094 10.6187"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2.5 7V9H4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NetworkGraph;
