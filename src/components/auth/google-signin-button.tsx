"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // サインイン後、現在のページ (トップページ) に戻るようにする
      // 認証状態が更新され、次回レンダリング時に TopPageClient が表示される
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      // エラーハンドリング (例: トースト表示)
      console.error("Sign in error:", error);
      setIsLoading(false);
      // ここで toast.error("サインインに失敗しました。"); のような表示を行う
    }
    // signIn がリダイレクトするため、通常ここには到達しないが念のため
    // setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center">ようこそ</h1>
        <p className="text-center text-muted-foreground">
          続けるにはサインインしてください。
        </p>
        <Button
          onClick={handleSignIn}
          className="w-full"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-5 w-5" />
          )}
          Google でサインイン
        </Button>
      </div>
    </div>
  );
}
