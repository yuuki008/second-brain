import { notFound } from "next/navigation";
import NodeDetail from "./components/node-detail";
import {
  getAllTags,
  getNode,
  getNodeWithRelatedNodes,
  incrementNodeViewCount,
  getNodeReactions,
} from "./actions";
import { getAuthStatus } from "@/app/actions/auth";

interface NodePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NodePageProps) {
  const { id } = await params;
  const node = await getNode(id);

  if (!node) {
    return {
      title: "ノードが見つかりません",
    };
  }

  // description が HTML の場合は、テキストを抽出
  const extractText = (html: string) => {
    // タグを削除
    const withoutTags = html.replace(/<[^>]*>/g, " ");
    // 連続する空白を1つに置換
    const cleanText = withoutTags.replace(/\s+/g, " ").trim();
    return cleanText.slice(0, 150) + "...";
  };

  const description = extractText(node.content);

  return {
    title: node.name,
    description,
  };
}

export default async function NodePage({ params }: NodePageProps) {
  const { id } = await params;
  const nodeData = await getNodeWithRelatedNodes(id);
  const allTags = await getAllTags();
  const reactions = await getNodeReactions(id);

  // サーバーサイドで認証状態を確認
  const { isAuthenticated } = await getAuthStatus();

  // ページ表示時にビューカウントをインクリメント（管理者以外の場合のみ）
  await incrementNodeViewCount(id, isAuthenticated);

  if (!nodeData) {
    notFound();
  }

  return (
    <NodeDetail
      id={id}
      node={nodeData.node}
      graphData={nodeData.graphData}
      allTags={allTags}
      reactions={reactions}
    />
  );
}
