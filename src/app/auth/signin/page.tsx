"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc"; // Googleアイコン用

// Provider 型の定義 (getProviders の戻り値の型)
interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

type Providers = Record<string, Provider>;

export default function SignInPage() {
  const [providers, setProviders] = useState<Providers | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchProviders() {
      const res = await getProviders();
      setProviders(res);
    }
    fetchProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    // サインイン後、ルートパスにリダイレクトさせる
    // ルートパス側でユーザー名が設定されていればユーザーページへ、
    // 未設定ならユーザー名設定フォームが表示される
    await signIn(providerId, { callbackUrl: "/" });
    // signIn 関数はリダイレクトを処理するため、setIsLoading(false) は不要な場合が多い
  };

  if (!providers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-xs p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center">サインイン</h1>
        <div>
          {Object.values(providers).map((provider) => {
            // Google プロバイダーのみ表示 (必要に応じて他も追加)
            if (provider.id === "google") {
              return (
                <div key={provider.name}>
                  <Button
                    onClick={() => handleSignIn(provider.id)}
                    className="w-full"
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-5 w-5" />
                    )}
                    {provider.name} でサインイン
                  </Button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
