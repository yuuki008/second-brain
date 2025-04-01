import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export function ImageComponent({ node }: NodeViewProps) {
  const { src, alt, loading } = node.attrs;

  if (loading) {
    return (
      <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
        <Skeleton className="w-[500px] h-[500px]" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
      <Image src={src} width={500} height={500} alt={alt || ""} />
    </NodeViewWrapper>
  );
}
