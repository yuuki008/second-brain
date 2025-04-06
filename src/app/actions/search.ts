"use server";

import { prisma } from "@/lib/prisma";
import { Node, Tag } from "@prisma/client";

export async function getAllNodes(): Promise<(Node & { tags: Tag[] })[]> {
  const nodes = await prisma.node.findMany({
    include: {
      tags: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return nodes;
}

export async function getNodeCount(): Promise<number> {
  return await prisma.node.count();
}

export async function getPaginatedNodes(
  limit: number = 15,
  cursor?: string
): Promise<{
  nodes: (Node & { tags: Tag[] })[];
  nextCursor: string | undefined;
}> {
  // カーソルが指定されている場合は、そのIDより前のノードを取得
  const nodes = await prisma.node.findMany({
    take: limit + 1, // 次のページがあるか確認するために1つ多く取得
    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1, // カーソル自体はスキップ
        }
      : {}),
    include: {
      tags: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // 次のページがあるかどうかを確認
  let nextCursor: string | undefined = undefined;
  if (nodes.length > limit) {
    const nextItem = nodes.pop();
    nextCursor = nextItem?.id;
  }

  return {
    nodes,
    nextCursor,
  };
}

export async function createNewNode(
  name: string
): Promise<Node & { tags: Tag[] }> {
  return await prisma.node.create({
    data: {
      name,
      content: "",
    },
    include: { tags: true },
  });
}
