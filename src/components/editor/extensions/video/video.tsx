import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { Video as VideoIcon } from "lucide-react";
import { uploadFile } from "@/app/actions/supabase";

export function VideoComponent({ node, updateAttributes }: NodeViewProps) {
  const { src, loading } = node.attrs;
  const [isLoading, setIsLoading] = useState(loading || false);
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
        loading: false,
      });
    } catch (error) {
      console.error("動画のアップロードに失敗しました:", error);
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
        <Skeleton className="w-[500px] h-[281px]" />
      </NodeViewWrapper>
    );
  }

  if (!src) {
    return (
      <NodeViewWrapper className="mx-auto w-full my-4 cursor-pointer">
        <div
          className="w-full h-[281px] flex items-center justify-center bg-muted"
          onClick={openFileSelector}
        >
          <VideoIcon className="w-10 h-10" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="video/*"
          style={{ display: "none" }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mx-auto w-full my-4">
      <video controls width="500" src={src}>
        ブラウザが動画タグをサポートしていません。
      </video>
    </NodeViewWrapper>
  );
}
