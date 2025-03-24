"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Node } from "@prisma/client";

export async function createTerm(name: string, content: string): Promise<Node> {
  return await prisma.node.create({
    data: { name, content },
  });
}

/**
 * 用語の定義を更新するサーバーアクション
 * @param termId - 更新する用語のID
 * @param definition - 新しい定義内容
 */
export async function updateTermDefinition(termId: string, definition: string) {
  try {
    // Prismaを使用してデータベースを直接更新
    await prisma.node.update({
      where: { id: termId },
      data: {
        content: definition,
        updatedAt: new Date(),
      },
    });

    // キャッシュを再検証して最新データを表示
    revalidatePath(`/term/${termId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating term definition:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * ノードからタグを削除するサーバーアクション
 * @param nodeId - タグを削除するノードのID
 * @param tagId - 削除するタグのID
 */
export async function removeTagFromNode(nodeId: string, tagId: string) {
  try {
    // 現在のノードを取得
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: { tags: true },
    });

    if (!node) {
      throw new Error("Node not found");
    }

    // ノードからタグの関連付けを解除
    await prisma.node.update({
      where: { id: nodeId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
        updatedAt: new Date(),
      },
    });

    // キャッシュを再検証して最新データを表示
    revalidatePath(`/term/${nodeId}`);

    return { success: true };
  } catch (error) {
    console.error("Error removing tag from node:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * ノードにタグを追加するサーバーアクション
 * @param nodeId - タグを追加するノードのID
 * @param tagId - 追加するタグのID
 */
export async function addTagToNode(nodeId: string, tagId: string) {
  try {
    // ノードにタグを関連付ける
    await prisma.node.update({
      where: { id: nodeId },
      data: {
        tags: {
          connect: { id: tagId },
        },
        updatedAt: new Date(),
      },
    });

    // キャッシュを再検証して最新データを表示
    revalidatePath(`/term/${nodeId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding tag to node:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * 利用可能なすべてのタグを取得するサーバーアクション
 */
export async function getAllTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, tags };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return { success: false, error: (error as Error).message, tags: [] };
  }
}
