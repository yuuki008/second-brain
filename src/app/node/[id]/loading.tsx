import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const NodeDetailSkeleton = () => {
  return (
    <div className="w-[90%] mx-auto pt-16 pb-[80vh]">
      <div className="relative max-w-2xl mx-auto">
        <div className="min-h-full flex flex-col">
          <div>
            {/* ノード名エディタのスケルトン */}
            <Skeleton className="h-14 w-[70%] mb-4" />

            {/* タグマネージャーのスケルトン */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          {/* エディタ部分のスケルトン */}
          <div className="flex-1 mt-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-[80%]" />
              <Skeleton className="h-6 w-[90%]" />
              <Skeleton className="h-6 w-[70%]" />
              <Skeleton className="h-6 w-[85%]" />
              <Skeleton className="h-6 w-[75%]" />
              <Skeleton className="h-6 w-[60%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Loading() {
  return <NodeDetailSkeleton />;
}
