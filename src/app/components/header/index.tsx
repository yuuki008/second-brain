"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Header() {
  const { theme } = useTheme();

  return (
    <div className="fixed top-0 left-0 pl-5 z-[30] bg-transparent w-full">
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
