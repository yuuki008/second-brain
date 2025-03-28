import prisma from "@/lib/prisma";
import NetworkGraph from "./graph";

export interface NodeData {
  id: string;
  name: string;
  content: string;
}

export type GraphData = {
  nodes: NodeData[];
  links: {
    source: string;
    target: string;
  }[];
};

// ノードデータを取得する関数
async function getNodes() {
  try {
    const nodes = await prisma.node.findMany();

    // NetworkGraphコンポーネント用の形式に変換
    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      content: node.content,
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
  const [nodes, links] = await Promise.all([getNodes(), getRelations()]);

  // クライアントコンポーネント用のデータ
  const graphData = {
    nodes,
    links,
  };

  return (
    <div className="h-screen w-screen">
      <NetworkGraph key={graphData.nodes.length} graphData={graphData} />
    </div>
  );
}
