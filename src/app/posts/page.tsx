import { getPaginatedNodes, getNodeCount } from "@/app/actions/search";
import { Metadata } from "next";
import PostsList from "./components/posts-list";

export const metadata: Metadata = {
  title: "Recent Posts | Second Brain",
  description: "List of recently updated nodes",
};

export default async function PostsPage() {
  const { nodes, nextCursor } = await getPaginatedNodes(15);
  const totalCount = await getNodeCount();

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-2">Posts</h1>
      <div className="text-sm text-muted-foreground mb-2 flex justify-end">
        {totalCount} posts
      </div>

      <PostsList initialNodes={nodes} nextCursor={nextCursor} />
    </div>
  );
}
