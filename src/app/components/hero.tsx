"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";

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
        <Image
          src="/profile.jpg"
          alt="キャラクター"
          width={150}
          height={150}
          className="mx-auto rounded-full"
          priority
        />
        <h2 className="mt-4 text-3xl font-extrabold text-center">
          Folk Your Brain
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
