"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";

export default function Hero() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative w-full flex justify-center">
          <div className="w-full max-w-[500px] absolute bottom-[180px] left-1/2 -translate-x-1/2 p-4 bg-secondary rounded-lg text-left text-sm">
            <TypeAnimation
              className="whitespace-pre-wrap"
              sequence={[
                `頭の中がたくさんの情報で溢れてる。
本で読んだこと、人から聞いた話、思いつき、どれも大切なのにすぐ忘れてしまう。
Second Brainは、情報を整理し、つなげることであなたの思考を拡張するプロダクトです。
まだ開発途中ですが、ぜひ使ってみてください。`,
              ]}
              speed={15}
              cursor={true}
              style={{ display: "inline-block" }}
            />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-secondary transform" />
          </div>

          <Image
            src="/profile.jpg"
            alt="キャラクター"
            width={150}
            height={150}
            className="rounded-full"
            priority
          />
        </div>

        <h2 className="mt-16 text-3xl leading-10 font-extrabold text-center">
          Folk Your Brain,
          <br />
          Build Second Brain
        </h2>
        <div className="mt-8">
          <Button
            onClick={handleSignIn}
            variant="outline"
            disabled={isLoading}
            className="w-full max-w-xs mx-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Google でサインインして始める
          </Button>
        </div>
      </div>
    </div>
  );
}
