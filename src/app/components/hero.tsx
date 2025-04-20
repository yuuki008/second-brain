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
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="fixed top-4 left-4">
          <div className="flex items-start gap-3">
            <Image
              src="/profile.jpg"
              alt="開発者"
              width={40}
              height={40}
              className="rounded-full shadow-md border border-primary/20 mt-1"
              priority
            />
            <div className="bg-secondary rounded-lg p-3 text-left text-sm shadow-md w-full max-w-[400px] relative">
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
              <div className="absolute left-[-5px] top-3 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-secondary border-b-[12px] border-b-transparent" />
            </div>
          </div>
        </div>

        <h2 className="mt-12 font-extrabold text-2xl lg:text-3xl text-center font-inter">
          <span className="text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue">
            Folk
          </span>{" "}
          Your Brain
          <br />
          <span className="text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue">
            Build
          </span>{" "}
          Second Brain
        </h2>

        <p className="mt-6 text-lg text-muted-foreground">
          考えを整理し、知識をつなげ、創造性を高める新しい方法
        </p>

        <div className="mt-10">
          <Button
            onClick={handleSignIn}
            variant="default"
            disabled={isLoading}
            className="w-full max-w-xs mx-auto shadow-md hover:shadow-lg transition-all text-lg py-6"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-6 w-6" />
            )}
            Google で今すぐ始める
          </Button>
        </div>
      </div>
    </div>
  );
}
