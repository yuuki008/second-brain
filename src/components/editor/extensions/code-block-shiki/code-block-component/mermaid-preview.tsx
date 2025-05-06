import { Node } from "@tiptap/pm/model";
import { useState, useEffect } from "react";
import mermaid from "mermaid";

type MermaidPreviewProps = {
  node: Node;
};

export default function MermaidPreview({ node }: MermaidPreviewProps) {
  const content = node.textContent;

  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "null",
      themeVariables: {
        lineColor: "hsl(var(--foreground))",
      },
      securityLevel: "loose",
      suppressErrorRendering: true,
    });

    const renderMermaid = async () => {
      if (content.trim()) {
        try {
          const cleanContent = content.trim();

          const { svg } = await mermaid.render(
            `mermaid-${Date.now()}`,
            cleanContent
          );
          setSvg(svg);
          setError("");
        } catch (err) {
          setError(
            `Mermaidパース中にエラーが発生しました: ${
              err instanceof Error ? err.message : "不明なエラー"
            }`
          );
          setSvg("");
        }
      } else {
        setSvg("");
        setError("");
      }
    };

    setTimeout(() => {
      renderMermaid();
    }, 1000);
  }, [content]);

  if (error) {
    return <div className="text-red-500 text-xs">{error}</div>;
  }

  return (
    <div
      className="mermaid w-full h-full flex justify-center items-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svg || "" }}
    />
  );
}
