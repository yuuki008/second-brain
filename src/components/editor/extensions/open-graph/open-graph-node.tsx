import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { getOpenGraphData } from "@/app/actions/open-graph";

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function OpenGraphNode(props: NodeViewProps) {
  const url = props.node.attrs.url;
  const [ogData, setOgData] = useState<OpenGraphData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOGData() {
      try {
        setIsLoading(true);
        const data = await getOpenGraphData(url);
        setOgData(data);
      } catch (error) {
        console.error("Error fetching OpenGraph data:", error);
        setOgData(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    if (url) {
      fetchOGData();
    }
  }, [url]);

  if (isLoading) {
    return (
      <NodeViewWrapper>
        <Card className="w-full max-w-2xl overflow-hidden my-4">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </NodeViewWrapper>
    );
  }

  if (!ogData) {
    return (
      <NodeViewWrapper>
        <div className="my-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {url}
          </a>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <Card className="w-full rounded-lg overflow-hidden my-4 hover:bg-accent/50 transition-colors">
        <Link
          href={ogData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block !no-underline"
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {ogData.image && (
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={ogData.image}
                    alt={ogData.title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2 flex flex-col justify-center">
                <div className="font-semibold line-clamp-1 text-accent text-lg">
                  {ogData.title}
                </div>
                {ogData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ogData.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {ogData.url}
                </p>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </NodeViewWrapper>
  );
}
