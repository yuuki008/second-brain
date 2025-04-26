import { notFound } from "next/navigation";
import NodeDetail from "./components/node-detail";
import {
  getAllTags,
  getNode,
  getNodeWithRelatedNodes,
  incrementNodeViewCount,
  getNodeReactions,
} from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  if (node.visibility === "PRIVATE") return { title: node.name };

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
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const nodeData = await getNodeWithRelatedNodes(id);
  const allTags = await getAllTags();
  const reactions = await getNodeReactions(id);

  await incrementNodeViewCount(id);

  if (!nodeData) {
    notFound();
  }

  const isAuthenticated = session?.user.id === nodeData.node.userId;
  const isPrivate = nodeData.node.visibility === "PRIVATE";

  if (isPrivate && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">
          この{nodeData.node.name}は非公開です
        </h1>
      </div>
    );
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
