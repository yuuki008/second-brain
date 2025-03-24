import React from "react";

// 記憶や学習に関する名言のリスト
const quotes = [
  {
    text: "By learning you will teach yourself how much you do not know.",
    author: "Plato",
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
  },
  {
    text: "Education is what remains after one has forgotten what one has learned in school.",
    author: "Albert Einstein",
  },
  {
    text: "Knowledge is power.",
    author: "Francis Bacon",
  },
  {
    text: "Repetition is the mother of learning.",
    author: "Latin Proverb",
  },
  {
    text: "Emotion lies between learning and memory.",
    author: "Cognitive Science Research",
  },
  {
    text: "There is a substantial gap between what we think we understand and what we actually understand.",
    author: "Dunning-Kruger Effect",
  },
  {
    text: "Retrieval practice is a more effective learning strategy than simply reviewing material.",
    author: "Testing Effect",
  },
  {
    text: "Learning is not a passive act of absorption but an active process of construction.",
    author: "Constructivism Theory",
  },
  {
    text: "Spaced learning is more effective for long-term memory than massed learning.",
    author: "Spacing Effect",
  },
];

export default function Loading() {
  // ランダムに名言を選択
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-8">
      <div className="flex flex-col items-center gap-6 max-w-md px-4">
        <div className="text-center bg-muted/50 p-6 rounded-lg border border-muted">
          <blockquote className="text-lg italic text-foreground">
            &ldquo;{randomQuote.text}&rdquo;
          </blockquote>
          <cite className="block mt-2 text-sm text-muted-foreground">
            — {randomQuote.author}
          </cite>
        </div>
      </div>
    </div>
  );
}
