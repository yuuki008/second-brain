import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoComponent({ node }: NodeViewProps) {
  const { src, loading } = node.attrs;

  if (loading) {
    return (
      <NodeViewWrapper>
        <Skeleton className="w-full h-[450px] rounded-lg my-4" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <video controls className="w-full rounded-lg my-4">
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </NodeViewWrapper>
  );
}
