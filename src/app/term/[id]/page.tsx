import { notFound } from "next/navigation";
import { Term } from "@/types";
import TermDetail from "./TermDetail";
import { generateGraphData } from "@/data/graphData";

// 用語の型定義
interface TermNode {
  id: string;
  name: string;
  tags: { id: string; name: string; color: string }[];
}

interface GraphData {
  nodes: TermNode[];
  links: {
    source: string;
    target: string;
  }[];
}

// すべての関連ノードとリンクを取得する関数
function getRelatedNodesAndLinks(termId: string): GraphData {
  // グラフデータを生成
  const graphData = generateGraphData([]);

  // 中心となる用語を取得
  const centerTerm = graphData.nodes.find((node) => node.id === termId);
  if (!centerTerm) {
    return { nodes: [], links: [] };
  }

  // 関連リンクを抽出
  const relatedLinks = graphData.links.filter(
    (link) => link.source === termId || link.target === termId
  );

  // 関連ノードのIDを抽出
  const relatedNodeIds = new Set<string>();
  relatedLinks.forEach((link) => {
    if (link.source === termId) {
      relatedNodeIds.add(link.target);
    } else if (link.target === termId) {
      relatedNodeIds.add(link.source);
    }
  });

  // 中心ノードも追加
  relatedNodeIds.add(termId);

  // 関連ノードを抽出
  const nodes = graphData.nodes.filter((node) => relatedNodeIds.has(node.id));

  // 最終的な関連リンクを取得（関連ノード間のもののみ）
  const links = graphData.links.filter(
    (link) => relatedNodeIds.has(link.source) && relatedNodeIds.has(link.target)
  );

  return { nodes, links };
}

// ダミーの用語データを生成
function createDummyDefinition(term: TermNode, allNodes: TermNode[]): string {
  // ランダムに2-3つの関連用語を選択
  const otherNodes = allNodes.filter((node) => node.id !== term.id);
  const shuffledNodes = [...otherNodes].sort(() => 0.5 - Math.random());
  const relatedTerms = shuffledNodes.slice(
    0,
    Math.min(3, shuffledNodes.length)
  );

  // 基本的な説明テキスト
  let definition = `${term.name}は、テクノロジーの世界で重要な概念です。`;

  // 関連用語へのリンクを含む説明文
  if (relatedTerms.length > 0) {
    definition += ` 主な関連技術には`;
    relatedTerms.forEach((relatedTerm, index) => {
      if (index > 0) {
        definition += index === relatedTerms.length - 1 ? `、そして` : `、`;
      }
      definition += `[term:${relatedTerm.id}]`;
    });
    definition += `があります。`;
  }

  // 追加の説明文
  definition += ` ${term.name}を理解することは、現代のソフトウェア開発において非常に重要です。`;

  return definition;
}

// 用語データを取得する関数
function getTermData(id: string): { term: Term; graphData: GraphData } | null {
  // グラフデータを生成
  const graphData = generateGraphData([]);
  const termNode = graphData.nodes.find((node) => node.id === id);

  if (!termNode) return null;

  // ダミーの定義を生成
  const definition = createDummyDefinition(termNode, graphData.nodes);

  // HTMLリンク付きの定義を生成
  const enhancedDefinition = definition.replace(
    /\[term:([^\]]+)\]/g,
    (_, termId) => {
      const linkedTerm = graphData.nodes.find((node) => node.id === termId);
      return linkedTerm
        ? `<span class="text-blue-500 cursor-pointer underline" data-term-id="${termId}">${linkedTerm.name}</span>`
        : "";
    }
  );

  // 用語データを作成
  const term: Term = {
    id: termNode.id,
    name: termNode.name,
    definition: enhancedDefinition,
    createdAt: new Date(Date.now() - Math.random() * 10000000000),
    updatedAt: new Date(Date.now() - Math.random() * 1000000000),
    tags: termNode.tags,
  };

  // 関連ノードとリンクを取得
  const relatedGraphData = getRelatedNodesAndLinks(id);

  return {
    term,
    graphData: relatedGraphData,
  };
}

// サーバーコンポーネント
interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  const termData = getTermData(params.id);

  if (!termData) {
    notFound();
  }

  return (
    <TermDetail
      id={params.id}
      term={termData.term}
      graphData={termData.graphData}
    />
  );
}
