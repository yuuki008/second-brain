"use server";

import prisma from "@/lib/prisma";

export async function createNode(name: string) {
  const node = await prisma.node.create({
    data: {
      name,
      content: "",
    },
  });

  return node;
}

export async function deleteNode(nodeId: string) {
  await prisma.node.delete({
    where: { id: nodeId },
  });

  return { success: true };
}
