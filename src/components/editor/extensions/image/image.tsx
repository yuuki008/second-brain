import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/app/actions/supabase";

export function ImageComponent({ node, updateAttributes }: NodeViewProps) {
  const { src, alt, loading } = node.attrs;

  const [isLoading, setIsLoading] = useState(loading);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkeletonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const { url } = await uploadFile(file);

    updateAttributes({
      src: url,
      alt: file.name,
      loading: false,
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
        <Skeleton className="w-[300px] h-[300px]" />
      </NodeViewWrapper>
    );
  }

  if (!src) {
    return (
      <NodeViewWrapper className="mx-auto w-full max-w-[300px] my-4 cursor-pointer">
        <div
          className="w-[300px] h-[300px] flex items-center justify-center bg-muted"
          onClick={handleSkeletonClick}
        >
          <ImageIcon className="w-10 h-10" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
      <Image src={src} width={500} height={500} alt={alt || ""} />
    </NodeViewWrapper>
  );
}
