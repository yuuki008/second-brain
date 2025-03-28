"use client";

import React from "react";
import Image from "next/image";
// import { useTheme } from "next-themes";

export default function Loading() {
  // const { theme } = useTheme();
  // const isDark = theme === "dark";

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <Image src="/thinking-brain.png" alt="logo" width={300} height={300} />

        <div className="text-center font-medium text-3xl tracking-wider font-mono flex">
          {["t", "h", "i", "n", "k", "i", "n", "g"].map((letter, index) => (
            <span
              key={index}
              className="animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
