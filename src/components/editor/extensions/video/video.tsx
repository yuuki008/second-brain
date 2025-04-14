import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/app/actions/supabase";

export function VideoComponent({ node, updateAttributes }: NodeViewProps) {
  const { src, loading } = node.attrs;
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
      loading: false,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (src) {
      setIsLoading(false);
    }
  }, [src]);

  if (isLoading) {
    return (
      <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
        <Skeleton className="w-[500px] h-[281px]" />
      </NodeViewWrapper>
    );
  }

  if (!src) {
    return (
      <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4 cursor-pointer">
        <div
          className="w-[500px] h-[281px] flex items-center justify-center bg-muted"
          onClick={handleSkeletonClick}
        >
          <ImageIcon className="w-10 h-10" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*" // accept 属性を video/* に変更
          style={{ display: "none" }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mx-auto w-full max-w-[500px] my-4">
      <video controls width="500" src={src}>
        Your browser does not support the video tag.
      </video>
    </NodeViewWrapper>
  );
}
