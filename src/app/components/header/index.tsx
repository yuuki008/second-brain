"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useZen } from "@/components/providers/zen-provider";
import { cn } from "@/lib/utils";

export default function Header() {
  const { theme } = useTheme();
  const { isZenMode } = useZen();

  return (
    <div
      className={cn(
        "fixed top-0 left-0 pl-5 z-[30] bg-transparent py-4 transition-all duration-300",
        isZenMode && "hidden"
      )}
    >
      <Link className="cursor-pointer" href="/">
        <Image
          src={theme === "dark" ? "/dark-sign.png" : "/light-sign.png"}
          alt="logo"
          width={35}
          height={35}
          className="object-contain"
        />
      </Link>
    </div>
  );
}
