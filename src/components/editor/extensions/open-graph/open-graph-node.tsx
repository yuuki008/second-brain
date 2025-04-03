import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { memo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import scrapeMetaInfo, { MetaInfo } from "@/app/actions/open-graph";

function OpenGraphNodeComponent(props: NodeViewProps) {
  const url = props.node.attrs.url;
  const [ogData, setOgData] = useState<MetaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOGData() {
      try {
        setIsLoading(true);
        const data = await scrapeMetaInfo(url);
        setOgData(data);
      } catch (error) {
        console.log(error);
        console.error("Error fetching OpenGraph data:", error);
        setOgData(null);
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
        <Card className="w-full overflow-hidden my-4">
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

  const domain = new URL(url).hostname;

  return (
    <NodeViewWrapper>
      <Card className="w-full rounded-lg overflow-hidden my-4 hover:bg-accent/50 transition-colors">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block !no-underline"
        >
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              {ogData.ogImage && (
                <div className="relative h-24 max-w-[230px] flex-shrink-0">
                  {/* Note: next/image を使うとサーバー側リクエストが発生して、URL のサイト側でブラウザ以外からのアクセスを拒んでいることがあるため、img を使う */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ogData.ogImage || ogData.faviconUrl}
                    alt={ogData.title}
                    className="rounded-md w-full h-full object-cover !my-0"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="font-semibold line-clamp-1 text-accent text-base">
                  {ogData.title}
                </div>
                {ogData.description && (
                  <p className="text-sm !text-muted-foreground line-clamp-1 !mt-0">
                    {ogData.description}
                  </p>
                )}
                <div className="!text-xs !text-muted-foreground !truncate flex items-center">
                  {ogData.faviconUrl && (
                    // Note: next/image を使うとサーバー側リクエストが発生して、URL のサイト側でブラウザ以外からのアクセスを拒んでいることがあるため、img を使う
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ogData.faviconUrl}
                      alt=""
                      className="rounded-full mr-1 w-4 h-4 !my-0"
                    />
                  )}
                  {domain}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </NodeViewWrapper>
  );
}

export const OpenGraphNode = memo(OpenGraphNodeComponent);
