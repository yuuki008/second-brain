import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";

export default function YouTubeComponent({ node }: NodeViewProps) {
  const url = node.attrs.url;
  const videoIdRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/g;
  const id = videoIdRegex.exec(url)?.[1];

  if (!id) {
    return (
      <NodeViewWrapper className="my-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {url}
        </a>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative pb-[56.25%] h-0">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
    </NodeViewWrapper>
  );
}
