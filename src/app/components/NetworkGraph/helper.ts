import { NodeData, LinkData } from ".";
import * as d3 from "d3";

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
