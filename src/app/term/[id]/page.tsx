import { notFound } from "next/navigation";
import { Term } from "@/types";
import { allTerms } from "@/lib/terms";
import TermDetail from "./TermDetail";

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
  // 中心となる用語を取得
  const centerTerm = allTerms.find((term: Term) => term.id === termId);
  if (!centerTerm) {
    return { nodes: [], links: [] };
  }

  // 関連用語のIDを抽出（定義内の[term:id]形式のリンクから）
  const relatedTermIds = new Set<string>();
  const regex = /\[term:([^\]]+)\]/g;
  let match;

  while ((match = regex.exec(centerTerm.definition)) !== null) {
    relatedTermIds.add(match[1]);
  }

  // 中心用語を参照している他の用語も関連ノードとして追加
  allTerms.forEach((term: Term) => {
    if (term.id !== termId) {
      const termRegex = new RegExp(`\\[term:${termId}\\]`, "g");
      if (termRegex.test(term.definition)) {
        relatedTermIds.add(term.id);
      }
    }
  });

  // 関連用語をノードとして追加
  const nodes: TermNode[] = [
    {
      id: centerTerm.id,
      name: centerTerm.name,
      tags: centerTerm.tags,
    },
  ];

  const links: { source: string; target: string }[] = [];

  // 関連用語をノードとリンクとして追加
  relatedTermIds.forEach((relatedId) => {
    const relatedTerm = allTerms.find((term: Term) => term.id === relatedId);
    if (relatedTerm) {
      // ノードを追加
      nodes.push({
        id: relatedTerm.id,
        name: relatedTerm.name,
        tags: relatedTerm.tags,
      });

      // リンクを追加（中心用語から関連用語へ）
      links.push({
        source: centerTerm.id,
        target: relatedTerm.id,
      });
    }
  });

  return { nodes, links };
}

// 用語データを取得する関数
function getTermData(id: string): { term: Term; graphData: GraphData } | null {
  const term = allTerms.find((t: Term) => t.id === id);
  if (!term) return null;

  // 定義内のリンクをHTMLに変換
  const enhancedDefinition = term.definition.replace(
    /\[term:([^\]]+)\]/g,
    (_match: string, termId: string) => {
      const linkedTerm = allTerms.find((t: Term) => t.id === termId);
      return linkedTerm
        ? `<span class="text-blue-500 cursor-pointer underline" data-term-id="${termId}">${linkedTerm.name}</span>`
        : "";
    }
  );

  // 強調された用語のデータを作成
  const enhancedTerm = {
    ...term,
    definition: enhancedDefinition,
  };

  // 関連ノードとリンクを取得
  const graphData = getRelatedNodesAndLinks(id);

  return {
    term: enhancedTerm,
    graphData,
  };
}

// サーバーコンポーネント
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const id = (await params).id;
  const termData = getTermData(id);

  if (!termData) {
    notFound();
  }

  return (
    <TermDetail id={id} term={termData.term} graphData={termData.graphData} />
  );
}
