import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HierarchicalTag } from "@/app/components/tag-filter";
import TopPageClient from "@/app/components/top-page-client";
import { Tag } from "@prisma/client";
import Hero from "./components/hero";
import SetupUsernameForm from "./components/setup-username-form";

async function getTags(userId: string): Promise<HierarchicalTag[]> {
  try {
    const buildHierarchy = (
      tagsData: (Tag & { children?: HierarchicalTag[] })[],
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
    return buildHierarchy(allTags);
  } catch (error) {
    console.error("タグの取得エラー:", error);
    return [];
  }
}

async function getNodes(userId: string) {
  try {
    const nodes = await prisma.node.findMany({
      include: {
        tags: true,
      },
      where: {
        userId,
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

// リレーションデータを取得する関数
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

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) return <Hero />;
  if (!session.user?.username)
    return <SetupUsernameForm userId={session.user.id} />;

  const [tags, nodes] = await Promise.all([
    getTags(session?.user.id),
    getNodes(session?.user.id),
  ]);
  const links = await getRelations(nodes.map((node) => node.id));

  const graphData = {
    nodes,
    links,
  };

  return <TopPageClient tags={tags} graphData={graphData} />;
}
