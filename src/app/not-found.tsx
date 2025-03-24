import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          ページが見つかりません
        </h1>

        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <p className="text-muted-foreground mb-4">
            お探しの用語が見つからないか、削除された可能性があります。
            別の用語を検索するか、トップページに戻ってください。
          </p>

          <Button asChild className="w-full gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              トップページに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
