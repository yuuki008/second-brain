"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import NetworkGraph from "@/app/components/NetworkGraph";
import { Badge } from "@/components/ui/badge";
import Editor from "@/components/editor";

interface TermNodeData {
  id: string;
  name: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface TermData {
  id: string;
  name: string;
  definition: string;
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface TermDetailProps {
  id: string;
  term: TermData;
  graphData: {
    nodes: TermNodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
}

const TermDetail: React.FC<TermDetailProps> = ({ id, term, graphData }) => {
  const router = useRouter();

  const [content, setContent] = useState(term.definition);

  const handleTermSelect = useCallback(
    (selectedNode: TermNodeData) => router.push(`/term/${selectedNode.id}`),
    [router]
  );

  return (
    <div className="h-screen w-full max-w-screen-xl p-10 mx-auto flex overflow-hidden">
      {/* 左側: 用語の説明 */}
      <div className="flex-1 min-h-full flex flex-col overflow-y-auto pr-10">
        <div className="mb-9">
          <h1 className="text-[2.5em] font-bold mb-4">{term.name}</h1>
          <div className="flex gap-2">
            {term.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="bg-muted">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Editor content={content} onChange={setContent} />
        </div>
      </div>

      {/* 右側: ネットワークグラフ */}
      <div className="w-[350px]">
        <div className="w-full h-[350px] border rounded-xl">
          <NetworkGraph
            graphData={{
              nodes: graphData.nodes,
              links: graphData.links,
            }}
            activeTagId={null}
            onNodeSelect={handleTermSelect}
            centerNodeId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default TermDetail;
