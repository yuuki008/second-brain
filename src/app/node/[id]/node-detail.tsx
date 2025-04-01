"use client";

import React, { useState, useEffect } from "react";
import Editor from "@/components/editor";
import {
  updateNodeDefinition,
  updateNodeName,
  updateNodeImageUrl,
} from "./actions";
import TagManager from "./tag-manager";
import { Node, Tag } from "@prisma/client";
import { useAuth } from "@/components/providers/auth-provider";
import { uploadFile } from "@/app/actions/supabase";
import Image from "next/image";

interface NodeNodeData {
  id: string;
  name: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface NodeDetailProps {
  id: string;
  node: Node & { tags: Tag[] };
  allTags: Tag[];
  graphData: {
    nodes: NodeNodeData[];
    links: {
      source: string;
      target: string;
    }[];
  };
}

// サムネイル画像アップロードコンポーネント
const ThumbnailUploader = React.memo(
  ({
    id,
    initialImgUrl,
    isReadOnly,
  }: {
    id: string;
    initialImgUrl?: string | null;
    isReadOnly: boolean;
  }) => {
    const [imgUrl, setImgUrl] = useState(initialImgUrl || null);

    const handleImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      if (!e.target.files || e.target.files.length === 0) return;

      try {
        const file = e.target.files[0];
        const { url } = await uploadFile(file);
        setImgUrl(url);

        // ノードのimageUrlを更新
        await updateNodeImageUrl(id, url);
      } catch (error) {
        console.error("画像アップロードエラー:", error);
      } finally {
      }
    };

    console.log(imgUrl);
    if (!imgUrl && isReadOnly) return <></>;

    return (
      <div className="mb-6">
        <div className="relative w-full h-48 mb-2 overflow-hidden">
          <label
            htmlFor="thumbnailUpload"
            className="absolute inset-0 cursor-pointer z-10 hover:bg-black/30 transition-colors duration-300"
          />
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt="ノードサムネイル"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2"></div>
          )}
        </div>
        <input
          id="thumbnailUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  }
);
ThumbnailUploader.displayName = "ThumbnailUploader";

// エディタ部分のみを扱う別コンポーネント
const NodeEditor = React.memo(
  ({
    id,
    initialContent,
    isReadOnly,
  }: {
    id: string;
    initialContent: string;
    isReadOnly: boolean;
  }) => {
    const [content, setContent] = useState(initialContent);

    // コンテンツが変更されたらデータベースに保存する
    useEffect(() => {
      // 読み取り専用モードまたは初期表示時は保存しない
      if (isReadOnly || content === initialContent) return;

      // デバウンス処理のための変数
      const timer = setTimeout(async () => {
        try {
          await updateNodeDefinition(id, content);
        } catch (error) {
          console.error("保存エラー:", error);
        }
      }, 1000); // 1秒のデバウンス

      // クリーンアップ関数
      return () => clearTimeout(timer);
    }, [content, id, initialContent, isReadOnly]);

    return (
      <Editor content={content} onChange={setContent} readOnly={isReadOnly} />
    );
  }
);
NodeEditor.displayName = "NodeEditor";

// ノード名を編集するコンポーネント
const NodeNameEditor = React.memo(
  ({
    id,
    initialName,
    isReadOnly,
  }: {
    id: string;
    initialName: string;
    isReadOnly: boolean;
  }) => {
    const [nodeName, setNodeName] = useState(initialName);

    useEffect(() => {
      // 読み取り専用モードまたは初期値と同じ場合は更新しない
      if (isReadOnly || nodeName === initialName) return;

      const timer = setTimeout(() => {
        updateNodeName(id, nodeName);
      }, 1000);
      return () => clearTimeout(timer);
    }, [nodeName, id, initialName, isReadOnly]);

    if (isReadOnly) {
      return (
        <h1 className="leading-[1.5] tracking-wide text-4xl font-bold mb-4">
          {nodeName}
        </h1>
      );
    }

    return (
      <input
        className="leading-[1.5] border-none tracking-wide text-4xl font-bold mb-4 bg-transparent focus:outline-none focus:ring-0 w-full"
        value={nodeName}
        onChange={(e) => setNodeName(e.target.value)}
      />
    );
  }
);
NodeNameEditor.displayName = "NodeNameEditor";

const NodeDetail: React.FC<NodeDetailProps> = ({ id, node, allTags }) => {
  const { isAuthenticated } = useAuth();
  const isReadOnly = !isAuthenticated;

  return (
    <div className="w-[90%] mx-auto pt-24 pb-[80vh]">
      <div className="relative max-w-2xl mx-auto">
        <div className="min-h-full flex flex-col">
          <div>
            <ThumbnailUploader
              id={id}
              initialImgUrl={node.imageUrl}
              isReadOnly={isReadOnly}
            />

            <NodeNameEditor
              id={id}
              initialName={node.name}
              isReadOnly={isReadOnly}
            />

            <TagManager nodeId={id} currentTags={node.tags} allTags={allTags} />
          </div>

          <div className="flex-1 mt-8">
            <NodeEditor
              id={id}
              initialContent={node.content}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
