import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export function ImageComponent({ node }: NodeViewProps) {
  const { src, alt, loading } = node.attrs;

  if (loading) {
    return (
      <NodeViewWrapper>
        <Skeleton className="w-[500px] h-[500px]" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <Image src={src} width={500} height={500} alt={alt || ""} />
    </NodeViewWrapper>
  );
}
