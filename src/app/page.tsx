import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HierarchicalTag } from "@/app/components/tag-filter";
import TopPageClient from "@/app/components/top-page-client";
import { Tag } from "@prisma/client";
import GoogleSignInButton from "@/components/auth/google-signin-button";

async function getTags(): Promise<HierarchicalTag[]> {
  try {
    const buildHierarchy = (
      tagsData: (Tag & { children?: HierarchicalTag[] })[],
      parentId: string | null = null
    ): HierarchicalTag[] => {
      return tagsData
        .filter((tag) => tag.parentId === parentId)
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          parentId: tag.parentId ?? "root",
          children: buildHierarchy(tagsData, tag.id),
        }));
    };
    const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    return buildHierarchy(allTags);
  } catch (error) {
    console.error("タグの取得エラー:", error);
    return [];
  }
}

async function getNodes() {
  try {
    const nodes = await prisma.node.findMany({
      include: {
        tags: true,
      },
      // ここでユーザーIDによる絞り込みは行わない（トップページ用）
    });
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
    const relations = await prisma.relation.findMany({});
    return relations.map((relation) => ({
      source: relation.fromNodeId,
      target: relation.toNodeId,
    }));
  } catch (error) {
    console.error("リレーションの取得エラー:", error);
    return [];
  }
}

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // 未認証の場合: Google サインインボタンを表示
    return <GoogleSignInButton />;
  } else {
    // 認証済みの場合: データを取得して TopPageClient を表示
    // 初回ログインで username がまだない場合も、ここでは TopPageClient を表示
    // (username 設定は /username ルートアクセス時に処理される)
    const [tags, nodes] = await Promise.all([getTags(), getNodes()]);
    const links = await getRelations();

    const graphData = {
      nodes,
      links,
    };

    return <TopPageClient tags={tags} graphData={graphData} />;
  }
}
