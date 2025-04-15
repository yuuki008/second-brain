import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/app/actions/supabase";

export function ImageComponent({ node, updateAttributes }: NodeViewProps) {
  const { src, alt, loading } = node.attrs;
  const [isLoading, setIsLoading] = useState(loading);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { url } = await uploadFile(file);
      updateAttributes({
        src: url,
        alt: file.name,
        loading: false,
      });
    } catch (error) {
      console.error("画像のアップロードに失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (src) {
      setIsLoading(false);
    }
  }, [src]);

  if (isLoading) {
    return (
      <NodeViewWrapper className="mx-auto w-full my-4">
        <Skeleton className="w-full h-[350px]" />
      </NodeViewWrapper>
    );
  }

  if (!src) {
    return (
      <NodeViewWrapper className="mx-auto w-full my-4 cursor-pointer">
        <div
          className="w-full h-[350px] flex items-center justify-center bg-muted"
          onClick={openFileSelector}
        >
          <ImageIcon className="w-10 h-10" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: "none" }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mx-auto w-full my-4">
      <Image src={src} width={1000} height={1000} alt={alt || ""} />
    </NodeViewWrapper>
  );
}
