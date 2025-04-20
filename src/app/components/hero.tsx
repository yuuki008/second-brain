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
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative w-full flex justify-center">
          <div className="w-full max-w-[500px] absolute bottom-[180px] left-1/2 -translate-x-1/2 p-4 bg-secondary rounded-lg text-left text-sm shadow-lg">
            <TypeAnimation
              className="whitespace-pre-wrap"
              sequence={[
                `アイデアや知識を整理できずに悩んでいませんか？
Second Brainは、あなたの頭の中を整理し、
思考をつなげるデジタルツールです。
情報をただ保存するだけでなく、活用できる形に変えます。`,
              ]}
              speed={15}
              cursor={true}
              style={{ display: "inline-block" }}
            />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-secondary transform" />
          </div>

          <Image
            src="/profile.jpg"
            alt="キャラクター"
            width={150}
            height={150}
            className="rounded-full shadow-lg border-2 border-primary/20"
            priority
          />
        </div>

        <h2 className="mt-8 font-extrabold text-lg lg:text-xl text-center font-inter">
          <span className="text-2xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue">
            Folk
          </span>{" "}
          Your Brain
          <br />
          <span className="text-2xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue">
            Build
          </span>{" "}
          Second Brain
        </h2>

        <p className="mt-4 text-muted-foreground">
          考えを整理し、知識をつなげ、創造性を高める新しい方法
        </p>

        <div className="mt-8">
          <Button
            onClick={handleSignIn}
            variant="default"
            disabled={isLoading}
            className="w-full max-w-xs mx-auto shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Google で今すぐ始める
          </Button>
        </div>
      </div>
    </div>
  );
}
