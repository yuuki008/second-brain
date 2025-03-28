import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 pl-5 z-[100] bg-transparent">
      <div className="flex items-center h-full py-4">
        <Link className="cursor-pointer" href="/">
          <Image
            src="/grinning-brain.png"
            alt="logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </Link>
      </div>
    </div>
  );
}
