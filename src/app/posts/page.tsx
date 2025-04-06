import { getPaginatedNodes } from "@/app/actions/search";
import { Metadata } from "next";
import PostsList from "./components/posts-list";

export const metadata: Metadata = {
  title: "最近の投稿 | Second Brain",
  description: "最近更新されたノード一覧",
};

export default async function PostsPage() {
  const { nodes, nextCursor } = await getPaginatedNodes(15);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      <PostsList initialNodes={nodes} nextCursor={nextCursor} />
    </div>
  );
}
