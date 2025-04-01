import { notFound } from "next/navigation";
import NodeDetail from "./node-detail";
import { getAllTags, getNode, getNodeWithRelatedNodes } from "./actions";
import { sleep } from "@/lib/utils";

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
  const description = node.content.replace(/<[^>]*>?/g, "");

  return {
    title: node.name,
    description,
    openGraph: {
      title: node.name,
      description: node.content,
      images: [{ url: node.imageUrl || "/thinking-brain.png" }],
    },
  };
}

export default async function NodePage({ params }: NodePageProps) {
  const { id } = await params;
  const nodeData = await getNodeWithRelatedNodes(id);
  const allTags = await getAllTags();

  if (!nodeData) {
    notFound();
  }

  return (
    <NodeDetail
      id={id}
      node={nodeData.node}
      graphData={nodeData.graphData}
      allTags={allTags}
    />
  );
}
