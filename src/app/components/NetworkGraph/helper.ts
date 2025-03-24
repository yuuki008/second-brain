import { NodeData, LinkData, NetworkGraphProps, D3CircleSelection } from ".";
import * as d3 from "d3";
import { cn } from "@/lib/utils";
import React from "react";

export function setupSimulation(
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

export function setupDragBehavior(
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

export function avoidCenter(
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

export function updatePositions(
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

export function updateSimulationForResize(
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

export function fitGraphToView(
  nodes: NodeData[],
  width: number,
  height: number,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  padding: number = 50
) {
  if (nodes.length === 0) return;

  // グラフの範囲を計算
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    }
  });

  // バウンディングボックスに余白を追加
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  // グラフの幅と高さを計算
  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  // スケールとトランスレーションを計算
  if (graphWidth > 0 && graphHeight > 0) {
    const scale = Math.min(
      width / graphWidth,
      height / graphHeight,
      1 // 最大スケールを1に制限
    );

    // 中心に配置するための移動量を計算
    const translateX = (width - graphWidth * scale) / 2 - minX * scale;
    const translateY = (height - graphHeight * scale) / 2 - minY * scale;

    // ズームトランスフォームを適用
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  }
}

export function convertLinksToNodeReferences(
  links: LinkData[],
  nodeMap: Map<string, NodeData>
) {
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
}

// 初期シミュレーションを実行して位置を安定させる
export function runInitialSimulation(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  iterations: number
) {
  simulation.alpha(1).restart();
  for (let i = 0; i < iterations; i++) {
    simulation.tick();
  }
}

// フィルタリング関数
export function filterGraphData(
  graphData: NetworkGraphProps["graphData"],
  activeTagId: string | null,
  allTagIds?: string[]
) {
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
}

// グラフの初期設定
export function initializeGraph(
  svgElement: SVGSVGElement,
  containerElement: HTMLDivElement
) {
  // コンテナのサイズを取得
  const containerRect = containerElement.getBoundingClientRect();
  const width = containerRect.width;
  const height = containerRect.height;

  // 既存のSVGをクリア
  d3.select(svgElement).selectAll("*").remove();

  // SVGの設定（最初は非表示）
  const svg = d3
    .select(svgElement)
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
  svg.on("dblclick.zoom", null);
  svg.on("dblclick", () => {
    const containerRect = containerElement.getBoundingClientRect();
    fitGraphToView([], containerRect.width, containerRect.height, zoom, svg);
  });

  const centerRadius = 150; // 詳細ページでない場合の中心の空白エリア
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    width,
    height,
    svg,
    zoomContainer,
    zoom,
    centerRadius,
    centerX,
    centerY,
  };
}

// グラフデータの準備
export function prepareGraphData(
  filteredNodes: NodeData[],
  filteredLinks: { source: string; target: string }[],
  centerNodeId?: string,
  width?: number,
  height?: number
) {
  // グラフデータの準備
  const nodes: NodeData[] = filteredNodes.map((d) => ({ ...d }));
  const links: LinkData[] = filteredLinks.map((d) => ({ ...d }));

  // ノードマップの作成とリンクの参照変換
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  convertLinksToNodeReferences(links, nodeMap);

  // 中心ノードの検索と設定
  const centerNode = centerNodeId ? nodeMap.get(centerNodeId) || null : null;
  if (centerNode && width && height) {
    centerNode.fx = width / 2;
    centerNode.fy = height / 2;
  }

  return { nodes, links, nodeMap, centerNode };
}

// リンクとノードの描画
export function drawGraphElements(
  zoomContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkData[],
  nodes: NodeData[],
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  centerNodeId?: string,
  onNodeSelect?: (node: NodeData) => void
) {
  // リンクの描画
  const link = zoomContainer
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", cn("transition-all duration-300", "stroke-border"));

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
        centerNodeId && d.id === centerNodeId ? "fill-blue" : "fill-primary"
      )
    )
    .on("mouseover", function (event, d) {
      handleNodeMouseOver(
        d3.select(this) as unknown as D3CircleSelection,
        d,
        links,
        link,
        node,
        centralNodeSize
      );
    })
    .on("mouseout", function (_, d) {
      const centerNode = centerNodeId
        ? nodes.find((n) => n.id === centerNodeId)
        : null;
      if (centerNode?.id === d.id) return;

      handleNodeMouseOut(
        d3.select(this) as unknown as D3CircleSelection,
        d,
        link,
        node,
        centerNodeId,
        otherNodeSize
      );
    })
    .on("click", (event, d) => {
      if (onNodeSelect) onNodeSelect(d);
    });

  // ノードのラベルの描画
  node
    .append("text")
    .attr("dx", 0)
    .attr("dy", -17)
    .attr("text-anchor", "middle")
    .attr("class", (d) =>
      centerNodeId && d.id === centerNodeId
        ? "font-bold text-base"
        : "font-normal text-xs"
    )
    .attr("fill", "hsl(var(--foreground))")
    .text((d) => d.name);

  return { link, node };
}

// ノードのマウスオーバー処理
export function handleNodeMouseOver(
  circleSelection: D3CircleSelection,
  node: NodeData,
  links: LinkData[],
  link: d3.Selection<d3.BaseType, LinkData, SVGGElement, unknown>,
  nodeSelection: d3.Selection<SVGGElement, NodeData, SVGGElement, unknown>,
  centralNodeSize: number = 12
) {
  circleSelection.attr("r", centralNodeSize);

  // ホバーしたノードに関連するリンクとノードを強調
  link
    .attr("stroke-opacity", (l) => {
      const isConnected =
        (l.source as NodeData).id === node.id ||
        (l.target as NodeData).id === node.id;
      return isConnected ? 1 : 0.1;
    })
    .attr("class", (l) => {
      const isConnected =
        (l.source as NodeData).id === node.id ||
        (l.target as NodeData).id === node.id;

      return cn(
        "transition-all duration-300",
        isConnected ? "stroke-blue" : "stroke-border"
      );
    });

  // 関連ノードを強調、それ以外を薄く
  nodeSelection.select("circle").attr("opacity", (n) => {
    // ホバーしているノード自身または接続されているノード
    const isConnected =
      n.id === node.id ||
      links.some(
        (l) =>
          ((l.source as NodeData).id === node.id &&
            (l.target as NodeData).id === n.id) ||
          ((l.source as NodeData).id === n.id &&
            (l.target as NodeData).id === node.id)
      );
    return isConnected ? 1 : 0.2;
  });

  // 関連するノードのテキストも強調
  nodeSelection
    .select("text")
    .attr("opacity", (n) => {
      const isConnected =
        n.id === node.id ||
        links.some(
          (l) =>
            ((l.source as NodeData).id === node.id &&
              (l.target as NodeData).id === n.id) ||
            ((l.source as NodeData).id === n.id &&
              (l.target as NodeData).id === node.id)
        );
      return isConnected ? 1 : 0.2;
    })
    .attr("class", (n) =>
      cn(
        "transition-all duration-300 z-20",
        n.id === node.id ? "text-base font-bold" : "text-xs font-normal"
      )
    );
}

// ノードのマウスアウト処理
export function handleNodeMouseOut(
  circleSelection: D3CircleSelection,
  node: NodeData,
  link: d3.Selection<d3.BaseType, LinkData, SVGGElement, unknown>,
  nodeSelection: d3.Selection<SVGGElement, NodeData, SVGGElement, unknown>,
  centerNodeId?: string,
  otherNodeSize: number = 7
) {
  circleSelection.attr("r", otherNodeSize);

  // すべてのリンクを元の状態に戻す
  link
    .attr("stroke-opacity", 1)
    .attr(
      "class",
      "transition-all duration-300 stroke-border stroke-width-[1.5]"
    );

  // すべてのノードを元の状態に戻す
  nodeSelection.select("circle").attr("opacity", 1);
  nodeSelection
    .select("text")
    .attr("opacity", 1)
    .attr("class", (n) =>
      cn(
        "transition-all duration-300",
        centerNodeId && n.id === centerNodeId
          ? "font-bold text-base"
          : "font-normal text-xs"
      )
    );
}

// シミュレーションのティック処理設定
export function setupSimulationTick(
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  nodes: NodeData[],
  centerNode: NodeData | null,
  centerNodeId: string | undefined,
  centerX: number,
  centerY: number,
  centerRadius: number,
  link: d3.Selection<d3.BaseType, LinkData, SVGGElement, unknown>,
  node: d3.Selection<SVGGElement, NodeData, SVGGElement, unknown>
) {
  simulation.on("tick", () => {
    // 中心付近を避けるように調整（詳細ページでは適用しない）
    if (!centerNodeId) {
      avoidCenter(nodes, centerNode, centerX, centerY, centerRadius);
    }

    // 要素の位置更新
    updatePositions(link, node);
  });
}

// リサイズハンドラの作成
export function createResizeHandler(
  containerRef: React.RefObject<HTMLDivElement | null>,
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
  centerRadius: number,
  centerNodeId: string | undefined,
  nodes: NodeData[],
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  return () => {
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
}
