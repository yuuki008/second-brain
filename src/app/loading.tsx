import React from "react";

export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl tracking-wider font-bold text-primary flex font-mono">
          {["S", "E", "C", "O", "N", "D"].map((letter, index) => (
            <span
              key={index}
              className="animate-bounce"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "1s",
                textShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              {letter}
            </span>
          ))}
          <span className="mx-1"></span>
          {["B", "R", "A", "I", "N"].map((letter, index) => (
            <span
              key={index + 7}
              className="animate-bounce"
              style={{
                animationDelay: `${(index + 7) * 0.1}s`,
                animationDuration: "1s",
                textShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
