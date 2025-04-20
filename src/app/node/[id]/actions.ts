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

    const hierarchicalTags = buildHierarchy(
      tags as unknown as TagWithChildren[]
    );

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
 * ノードのリアクションを取得するサーバーアクション
 * @param nodeId - リアクションを取得するノードのID
 */
export async function getNodeReactions(nodeId: string) {
  try {
    const reactions = await prisma.reaction.findMany({
      where: { nodeId },
    });

    // 絵文字ごとにグループ化してカウント
    const emojiCounts: Record<string, number> = {};
    reactions.forEach((reaction) => {
      if (emojiCounts[reaction.emoji]) {
        emojiCounts[reaction.emoji]++;
      } else {
        emojiCounts[reaction.emoji] = 1;
      }
    });

    // 絵文字と数を含むオブジェクトの配列に変換
    const groupedReactions = Object.entries(emojiCounts).map(
      ([emoji, count]) => ({
        emoji,
        count,
      })
    );

    // カウントの降順でソート
    return groupedReactions.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("リアクション取得エラー:", error);
    return [];
  }
}

/**
 * 特定の訪問者のリアクションを取得するサーバーアクション
 * @param nodeId - リアクションを取得するノードのID
 * @param visitorId - 訪問者ID
 */
export async function getVisitorReactions(nodeId: string, visitorId: string) {
  try {
    const reactions = await prisma.reaction.findMany({
      where: {
        nodeId,
        visitorId,
      },
      select: {
        emoji: true,
      },
    });

    return reactions.map((r) => r.emoji);
  } catch (error) {
    console.error("訪問者リアクション取得エラー:", error);
    return [];
  }
}

/**
 * ノードのリアクションをトグルするサーバーアクション
 * @param nodeId - リアクションを追加するノードのID
 * @param emoji - 絵文字
 * @param visitorId - 訪問者ID
 */
export async function toggleReaction(
  nodeId: string,
  emoji: string,
  visitorId: string
) {
  try {
    // 既存のリアクションを確認
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        nodeId_emoji_visitorId: {
          nodeId,
          emoji,
          visitorId,
        },
      },
    });

    if (existingReaction) {
      // 既存のリアクションがある場合は削除
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
    } else {
      // 新しいリアクションを作成
      await prisma.reaction.create({
        data: {
          emoji,
          nodeId,
          visitorId,
        },
      });
    }

    revalidatePath(`/node/${nodeId}`);
    return { success: true };
  } catch (error) {
    console.error("リアクショントグルエラー:", error);
    return { success: false, error: (error as Error).message };
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
