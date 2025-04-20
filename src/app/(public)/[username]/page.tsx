import { HierarchicalTag } from "@/app/components/tag-filter";
import TopPageClient from "@/app/components/top-page-client";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tag } from "@prisma/client";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

async function getTags(userId: string) {
  try {
    const buildHierarchy = (
      tagsData: (Tag & { children?: HierarchicalTag[] })[], // 型を Tag に変更
      parentId: string | null = null
    ): HierarchicalTag[] => {
      return tagsData
        .filter((tag) => tag.parentId === parentId)
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          parentId: tag.parentId ?? "root",
          children: buildHierarchy(tagsData, tag.id),
        }));
    };

    const allTags = await prisma.tag.findMany({
      where: {
        userId,
      },
      orderBy: { name: "asc" },
    });
    const hierarchicalTags = buildHierarchy(allTags);

    return hierarchicalTags;
  } catch (error) {
    console.error("タグの取得エラー:", error);
    return [];
  }
}

async function getNodes(userId: string) {
  try {
    const nodes = await prisma.node.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
      },
    });

    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      tags: node.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    }));
  } catch (error) {
    console.error("ノードの取得エラー:", error);
    return [];
  }
}

async function getRelations(nodeIds: string[]) {
  try {
    const relations = await prisma.relation.findMany({
      where: {
        fromNodeId: { in: nodeIds },
        toNodeId: { in: nodeIds },
      },
    });

    return relations.map((relation) => ({
      source: relation.fromNodeId,
      target: relation.toNodeId,
    }));
  } catch (error) {
    console.error("リレーションの取得エラー:", error);
    return [];
  }
}

export default async function UserHomePage({ params }: UserPageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, id: true },
  });

  if (!user) notFound();

  const [tags, nodes] = await Promise.all([
    getTags(user.id),
    getNodes(user.id),
  ]);

  const links = await getRelations(nodes.map((node) => node.id));
  const graphData = {
    nodes,
    links,
  };

  return <TopPageClient tags={tags} graphData={graphData} />;
}
