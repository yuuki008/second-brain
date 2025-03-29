"use client";

import { TweetProps, useTweet } from "react-tweet";

import {
  MagicTweet,
  TweetNotFound,
  TweetSkeleton,
} from "@/components/ui/tweet";
import { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";

function ClientTweetCard({
  id,
  apiUrl,
  fallback = <TweetSkeleton />,
  components,
  fetchOptions,
  onError,
  ...props
}: TweetProps & { className?: string }) {
  const { data, error, isLoading } = useTweet(id, apiUrl, fetchOptions);

  if (isLoading) return fallback;
  if (error || !data) {
    const NotFound = components?.TweetNotFound || TweetNotFound;
    return <NotFound error={onError ? onError(error) : error} />;
  }

  return <MagicTweet tweet={data} components={components} {...props} />;
}

export default function TweetComponent({ node }: NodeViewProps) {
  const url = node.attrs.url;
  const tweetIdRegex = /\/status\/(\d+)/g;
  const id = tweetIdRegex.exec(url)?.[1];

  return (
    <NodeViewWrapper className="my-4">
      <ClientTweetCard id={id || ""} />
    </NodeViewWrapper>
  );
}
