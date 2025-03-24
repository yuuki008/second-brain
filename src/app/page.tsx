import { PrismaClient } from "@prisma/client";
import { HierarchicalTag } from "@/app/components/TagFilter";
import TopPageClient from "@/app/components/TopPageClient";
import { sleep } from "@/lib/utils";

// Prismaクライアントの初期化
const prisma = new PrismaClient();

// タグデータを取得する関数
async function getTags() {
  try {
    const tags = await prisma.tag.findMany();

    // 階層構造を持つタグ形式に変換（現在はフラットなので簡易的に変換）
    const hierarchicalTags: HierarchicalTag[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      parentId: "root",
      children: [],
    }));

    return hierarchicalTags;
  } catch (error) {
    console.error("タグの取得エラー:", error);
    return [];
  }
}

// ノードデータを取得する関数
async function getNodes() {
  try {
    const nodes = await prisma.node.findMany({
      include: {
        tags: true,
      },
    });

    // NetworkGraphコンポーネント用の形式に変換
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
async function getRelations() {
  try {
    const relations = await prisma.relation.findMany();

    // NetworkGraphコンポーネント用の形式に変換
    return relations.map((relation) => ({
      source: relation.fromNodeId,
      target: relation.toNodeId,
    }));
  } catch (error) {
    console.error("リレーションの取得エラー:", error);
    return [];
  }
}

export default async function HomePage() {
  // データを並行して取得
  const [tags, nodes, links] = await Promise.all([
    getTags(),
    getNodes(),
    getRelations(),
  ]);

  // クライアントコンポーネント用のデータ
  const graphData = {
    nodes,
    links,
  };

  await sleep(100000);

  return <TopPageClient tags={tags} graphData={graphData} />;
}
