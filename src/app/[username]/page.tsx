import { HierarchicalTag } from "@/app/components/tag-filter";
import TopPageClient from "@/app/components/top-page-client";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SetupUsernameForm from "./components/setup-username-form";
import { Tag } from "@prisma/client";

interface UserPageProps {
  params: {
    username: string;
  };
}

// タグデータを取得する関数
async function getTags() {
  try {
    // const tags = await prisma.tag.findMany({ // 未使用のためコメントアウト
    //   orderBy: { name: "asc" },
    // });

    // 階層構造を持つタグ形式に変換
    const buildHierarchy = (
      tagsData: (Tag & { children?: HierarchicalTag[] })[], // 型を Tag に変更
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
    const hierarchicalTags = buildHierarchy(allTags);

    return hierarchicalTags;
  } catch (error) {
    console.error("タグの取得エラー:", error);
    return [];
  }
}

// ノードデータを取得する関数
async function getNodes(/* userId?: string */) {
  // 未使用のためコメントアウト
  try {
    const nodes = await prisma.node.findMany({
      include: {
        tags: true,
      },
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
async function getRelations(/* nodeIds?: string[] */) {
  // 未使用のためコメントアウト
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

export default async function UserHomePage({ params }: UserPageProps) {
  const session = await getServerSession(authOptions);

  // 1. 認証されていない場合はリダイレクト
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 2. URLのユーザー名とセッションのユーザー名が一致しない場合はエラー（またはリダイレクト）
  // まずはDBからユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // 3. ユーザー名が未設定の場合、設定フォームを表示
  if (!user.username) {
    return <SetupUsernameForm userId={session.user.id} />;
  }

  // 4. URLのユーザー名とDBのユーザー名が一致しない場合 (大文字小文字区別しない場合)
  if (params.username.toLowerCase() !== user.username.toLowerCase()) {
    return <div>ユーザーが見つかりません。</div>;
  }

  // 5. 認証済みでユーザー名も設定されている場合、データを取得して表示
  const [tags, nodes] = await Promise.all([getTags(), getNodes()]);

  const links = await getRelations();

  const graphData = {
    nodes,
    links,
  };

  return <TopPageClient tags={tags} graphData={graphData} />;
}
