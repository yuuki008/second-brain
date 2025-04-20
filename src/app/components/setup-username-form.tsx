"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { setUsernameAction } from "@/app/actions/user"; // サーバーアクションをインポート
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Zod スキーマでバリデーションルールを定義
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上である必要があります。" })
    .max(20, { message: "ユーザー名は20文字以下である必要があります。" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "ユーザー名は英数字とアンダースコアのみ使用できます。",
    }),
});

type UsernameFormInput = z.infer<typeof usernameSchema>;

interface SetupUsernameFormProps {
  userId: string;
}

export default function SetupUsernameForm({ userId }: SetupUsernameFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameFormInput>({
    resolver: zodResolver(usernameSchema),
  });

  const onSubmit: SubmitHandler<UsernameFormInput> = async (data) => {
    setIsLoading(true);
    try {
      const result = await setUsernameAction(userId, data.username);
      if (result.success) {
        toast.success("ユーザー名を設定しました。");
        // ユーザー名設定後、正しいユーザー名パスにリダイレクト
        router.push(`/${data.username}`);
        router.refresh(); // ページをリフレッシュして最新のセッション情報を反映
      } else {
        toast.error(result.error || "ユーザー名の設定に失敗しました。");
      }
    } catch (error) {
      console.error("ユーザー名設定エラー:", error);
      toast.error("予期せぬエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center">
          ユーザー名を設定してください
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          このユーザー名はプロフィールURLの一部となり、後から変更できません。
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">
              ユーザー名
            </label>
            <Input
              id="username"
              type="text"
              placeholder="希望のユーザー名"
              {...register("username")}
              className={errors.username ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-destructive mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "設定する"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
