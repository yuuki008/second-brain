"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Node } from "@prisma/client";

export async function createNode(name: string, content: string): Promise<Node> {
  return await prisma.node.create({
    data: { name, content },
  });
}

export async function updateNodeName(nodeId: string, name: string) {
  return await prisma.node.update({
    where: { id: nodeId },
    data: { name },
  });
}
/**
 * ノードの定義を更新するサーバーアクション
 * @param nodeId - 更新するノードのID
 * @param definition - 新しい定義内容
 */
export async function updateNodeDefinition(nodeId: string, definition: string) {
  try {
    // Prismaを使用してデータベースを直接更新
    await prisma.node.update({
      where: { id: nodeId },
      data: {
        content: definition,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating node definition:", error);
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
    revalidatePath(`/node/${nodeId}`);

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
    revalidatePath(`/node/${nodeId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding tag to node:", error);
    return { success: false, error: (error as Error).message };
  }
}

interface TagWithChildren {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  parentId: string | null;
  children: TagWithChildren[];
}

/**
 * 利用可能なすべてのタグを取得するサーバーアクション
 */
export async function getAllTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        children: true,
      },
    });

    // 階層構造を構築
    const buildHierarchy = (
      tags: TagWithChildren[],
      parentId: string | null = null
    ): TagWithChildren[] => {
      return tags
        .filter((tag) => tag.parentId === parentId)
        .map((tag) => ({
          ...tag,
          children: buildHierarchy(tags, tag.id),
        }));
    };

    const hierarchicalTags = buildHierarchy(tags as TagWithChildren[]);

    return hierarchicalTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

/**
 * 新しいタグを作成するサーバーアクション
 * @param name - タグの名前
 */
export async function createTag(name: string) {
  return await prisma.tag.create({
    data: {
      name,
      color: "#000000", // デフォルトの色
    },
  });
}

export async function updateTagHierarchy(
  tags: { id: string; parentId: string | null }[]
) {
  try {
    // トランザクションを使用して一括更新
    await prisma.$transaction(
      tags.map((tag) =>
        prisma.tag.update({
          where: { id: tag.id },
          data: { parentId: tag.parentId },
        })
      )
    );

    revalidatePath("/node/[id]");
    return { success: true };
  } catch (error) {
    console.error("タグの階層更新エラー:", error);
    throw error;
  }
}
