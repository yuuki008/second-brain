import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-2">Posts</h1>
      <div className="text-sm text-muted-foreground mb-2 flex justify-end">
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="relative space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
