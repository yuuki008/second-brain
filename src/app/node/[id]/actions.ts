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
 * ノードの画像URLを更新するサーバーアクション
 * @param nodeId - 更新するノードのID
 * @param imageUrl - 新しい画像URL（nullの場合は画像を削除）
 */
export async function updateNodeImageUrl(
  nodeId: string,
  imageUrl: string | null
) {
  try {
    await prisma.node.update({
      where: { id: nodeId },
      data: {
        imageUrl,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/node/${nodeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating node image URL:", error);
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

export async function getNode(id: string) {
  return await prisma.node.findUnique({
    where: { id },
  });
}

/**
 * ノードのビュー数を増加させるサーバーアクション
 * @param nodeId - ビュー数を増やすノードのID
 * @param isAuthenticated - 管理者としてログインしているかどうか
 */
export async function incrementNodeViewCount(
  nodeId: string,
  isAuthenticated: boolean = false
) {
  try {
    // 管理者としてログインしている場合はカウントを増やさない
    if (isAuthenticated) {
      return { success: true };
    }

    await prisma.node.update({
      where: { id: nodeId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("ビュー数更新エラー:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * ノードのリアクションを追加または更新するサーバーアクション
 * @param nodeId - リアクションを追加するノードのID
 * @param emoji - 絵文字
 */
export async function addReaction(nodeId: string, emoji: string) {
  try {
    // 既存のリアクションを確認
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        nodeId_emoji: {
          nodeId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // 既存のリアクションがある場合はカウントを増やす
      await prisma.reaction.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    } else {
      // 新しいリアクションを作成
      await prisma.reaction.create({
        data: {
          emoji,
          nodeId,
        },
      });
    }

    revalidatePath(`/node/${nodeId}`);
    return { success: true };
  } catch (error) {
    console.error("リアクション追加エラー:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * ノードのリアクションを取得するサーバーアクション
 * @param nodeId - リアクションを取得するノードのID
 */
export async function getNodeReactions(nodeId: string) {
  try {
    const reactions = await prisma.reaction.findMany({
      where: { nodeId },
      orderBy: { count: "desc" },
    });
    return reactions;
  } catch (error) {
    console.error("リアクション取得エラー:", error);
    return [];
  }
}

/**
 * ノードとその関連ノードを取得するサーバーアクション
 * @param id - 取得するノードのID
 */
export async function getNodeWithRelatedNodes(id: string) {
  try {
    // 指定されたIDのノードを取得
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!node) {
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
        id: node.id,
        name: node.name,
        tags: node.tags.map((tag) => ({
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

    return {
      node: node,
      graphData: {
        nodes: uniqueNodes,
        links,
      },
    };
  } catch (error) {
    console.error("ノードデータの取得エラー:", error);
    return null;
  }
}
