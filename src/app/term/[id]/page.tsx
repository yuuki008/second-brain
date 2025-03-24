import { notFound } from "next/navigation";
import TermDetail from "./TermDetail";
import { prisma } from "@/lib/prisma";

// 用語とその関連ノードを取得する関数
async function getTermWithRelatedNodes(id: string) {
  try {
    // 指定されたIDのノードを取得
    const term = await prisma.node.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!term) {
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
        id: term.id,
        name: term.name,
        tags: term.tags.map((tag) => ({
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

    // HTML形式の定義を作成（ノードリンクを含む）
    const enhancedDefinition = term.content.replace(
      /\[\[(.*?)\]\]/g,
      (_, nodeName) => {
        const linkedNode = uniqueNodes.find((n) => n.name === nodeName);
        return linkedNode
          ? `<span class="dark:bg-blue-500 bg-blue-300 hover:bg-blue-500 cursor-pointer dark:hover:bg-blue-600 transition-colors rounded-xs px-1 py-0.5" data-term-id="${linkedNode.id}">${nodeName}</span>`
          : nodeName;
      }
    );

    return {
      term: {
        id: term.id,
        name: term.name,
        definition: enhancedDefinition,
        createdAt: term.createdAt,
        updatedAt: term.updatedAt,
        tags: term.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      },
      graphData: {
        nodes: uniqueNodes,
        links,
      },
    };
  } catch (error) {
    console.error("用語データの取得エラー:", error);
    return null;
  }
}

interface TermPageProps {
  params: Promise<{ id: string }>;
}

export default async function TermPage({ params }: TermPageProps) {
  const { id } = await params;
  const termData = await getTermWithRelatedNodes(id);

  if (!termData) {
    notFound();
  }

  return (
    <TermDetail id={id} term={termData.term} graphData={termData.graphData} />
  );
}
