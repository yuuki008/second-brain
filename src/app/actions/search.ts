"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Node, Tag } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function getAllNodes(
  userIdArg?: string
): Promise<(Node & { tags: Tag[] })[]> {
  const userId = userIdArg ?? (await getServerSession(authOptions))?.user?.id;

  const nodes = await prisma.node.findMany({
    where: {
      userId,
    },
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
