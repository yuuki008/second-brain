"use server";

import { prisma } from "@/lib/prisma";
import { Node, Tag } from "@prisma/client";

export async function getAllNodes(): Promise<(Node & { tags: Tag[] })[]> {
  const nodes = await prisma.node.findMany({
    include: {
      tags: true,
    },
  });

  return nodes;
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
