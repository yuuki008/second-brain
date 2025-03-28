import { notFound } from "next/navigation";
import NodeDetail from "./NodeDetail";
import { prisma } from "@/lib/prisma";
import { getAllTags } from "./actions";

// ノードとその関連ノードを取得する関数
async function getNodeWithRelatedNodes(id: string) {
  try {
    // 指定されたIDのノードを取得
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!node) {
      return null;
    }

    // 関連するノードを取得（このノードへの参照を持つノード）
    const incomingRelations = await prisma.relation.findMany({
      where: { toNodeId: id },
      include: {
        fromNode: {
          include: {
            tags: true,
          },
        },
      },
    });

    // このノードが参照しているノードを取得
    const outgoingRelations = await prisma.relation.findMany({
      where: { fromNodeId: id },
      include: {
        toNode: {
          include: {
            tags: true,
          },
        },
      },
    });

    // グラフノードの作成
    const nodes = [
      {
        id: node.id,
        name: node.name,
        tags: node.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      },
      ...incomingRelations.map((rel) => ({
        id: rel.fromNode.id,
        name: rel.fromNode.name,
        tags: rel.fromNode.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      })),
      ...outgoingRelations.map((rel) => ({
        id: rel.toNode.id,
        name: rel.toNode.name,
        tags: rel.toNode.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      })),
    ];

    // 重複を除去
    const uniqueNodes = Array.from(
      new Map(nodes.map((node) => [node.id, node])).values()
    );

    // リンクの作成
    const links = [
      ...incomingRelations.map((rel) => ({
        source: rel.fromNodeId,
        target: id,
      })),
      ...outgoingRelations.map((rel) => ({
        source: id,
        target: rel.toNodeId,
      })),
    ];

    return {
      node: node,
      graphData: {
        nodes: uniqueNodes,
        links,
      },
    };
  } catch (error) {
    console.error("ノードデータの取得エラー:", error);
    return null;
  }
}

interface NodePageProps {
  params: Promise<{ id: string }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { id } = await params;
  const nodeData = await getNodeWithRelatedNodes(id);
  const allTags = await getAllTags();

  if (!nodeData) {
    notFound();
  }

  return (
    <NodeDetail
      id={id}
      node={nodeData.node}
      graphData={nodeData.graphData}
      allTags={allTags}
    />
  );
}
