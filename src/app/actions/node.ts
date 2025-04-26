"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Visibility } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createNode(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("ログインしてください");
  }

  const node = await prisma.node.create({
    data: {
      name,
      content: "",
      userId: session.user.id,
    },
    include: { tags: true },
  });

  return node;
}

export async function deleteNode(nodeId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("ログインしてください");
  }

  await prisma.node.delete({
    where: { id: nodeId },
  });

  return { success: true };
}

export async function updateNodeVisibility(
  nodeId: string,
  visibility: Visibility
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("ログインしてください");
  }

  await prisma.node.update({
    where: { id: nodeId },
    data: { visibility },
  });

  revalidatePath(`/node/${nodeId}`);
}
