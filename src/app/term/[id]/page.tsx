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

  // 関連ノードのIDを再帰的に収集する関数
  const collectRelatedNodeIds = (
    currentId: string,
    depth: number,
    collected: Set<string>
  ) => {
    if (depth <= 0) return;

    // 現在のノードを追加
    collected.add(currentId);

    // 関連リンクを取得
    const links = graphData.links.filter(
      (link) => link.source === currentId || link.target === currentId
    );

    // 関連ノードを再帰的に処理
    links.forEach((link) => {
      const nextId = link.source === currentId ? link.target : link.source;
      if (!collected.has(nextId)) {
        collectRelatedNodeIds(nextId, depth - 1, collected);
      }
    });
  };

  // 関連ノードのIDを収集（深さ3まで）
  const relatedNodeIds = new Set<string>();
  collectRelatedNodeIds(termId, 3, relatedNodeIds);

  // 関連ノードを抽出
  const nodes = graphData.nodes.filter((node) => relatedNodeIds.has(node.id));

  // 関連ノード間のリンクを抽出
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
        ? `<span class="bg-yellow-100 cursor-pointer hover:bg-yellow-300 transition-colors rounded-xs px-1 py-0.5" data-term-id="${termId}">${linkedTerm.name}</span>`
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
