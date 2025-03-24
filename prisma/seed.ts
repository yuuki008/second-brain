import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/ja";

const prisma = new PrismaClient();

// シードデータの数の設定
const NODE_COUNT = 20;
const TAG_COUNT = 10;
const RELATION_COUNT = 15;

// タグの色のリスト
const TAG_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#A855F7", // violet
];

async function main() {
  console.log("シードデータの作成を開始します...");

  // 既存のデータをクリア
  await prisma.relation.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.node.deleteMany();

  console.log("既存のデータを削除しました");

  // タグの作成
  const tagPromises = [];
  for (let i = 0; i < TAG_COUNT; i++) {
    const tagData = {
      name: `${i + 1}_${faker.word.adjective()}`,
      color: TAG_COLORS[i % TAG_COLORS.length],
    };

    tagPromises.push(
      prisma.tag.create({
        data: tagData,
      })
    );
  }

  const tags = await Promise.all(tagPromises);
  console.log(`${tags.length}個のタグを作成しました`);

  // ノードの作成
  const nodePromises = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // 各ノードに1〜3個のランダムなタグを割り当てる
    const tagIds = faker.helpers.arrayElements(
      tags.map((tag) => ({ id: tag.id })),
      faker.number.int({ min: 1, max: 3 })
    );

    const nodeData = {
      name: `${i + 1}_${faker.book.title()}`,
      content: faker.lorem.lines(10),
      imageUrl: faker.image.url(),
      tags: {
        connect: tagIds,
      },
    };

    nodePromises.push(
      prisma.node.create({
        data: nodeData,
        include: {
          tags: true,
        },
      })
    );
  }

  const nodes = await Promise.all(nodePromises);
  console.log(`${nodes.length}個のノードを作成しました`);

  const relationPromises = [];
  for (let i = 0; i < RELATION_COUNT; i++) {
    const fromNodeIndex = faker.number.int({ min: 0, max: nodes.length - 1 });
    let toNodeIndex;

    do {
      toNodeIndex = faker.number.int({ min: 0, max: nodes.length - 1 });
    } while (fromNodeIndex === toNodeIndex);

    const relationData = {
      fromNodeId: nodes[fromNodeIndex].id,
      toNodeId: nodes[toNodeIndex].id,
    };

    try {
      relationPromises.push(
        prisma.relation.create({
          data: relationData,
        })
      );
    } catch {
      console.log("リレーションの重複をスキップしました");
      i--; // 重複した場合は再試行
    }
  }

  try {
    const relations = await Promise.all(relationPromises);
    console.log(`${relations.length}個のリレーションを作成しました`);
  } catch (error) {
    console.error("一部のリレーション作成に失敗しました:", error);
  }

  console.log("シードデータの作成が完了しました！");
}

main()
  .catch((e) => {
    console.error("シード処理中にエラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
