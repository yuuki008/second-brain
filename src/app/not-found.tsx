import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="w-[300px] h-[300px] relative">
        <Image
          src="/crying-brain.png"
          alt="crying-brain"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="text-center font-medium font-mono leading-[1.5]">
        <div className="text-3xl tracking-wider mb-4">404 error</div>
        <p className="text-base">
          page not found, click{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            here
          </Link>{" "}
          to go back.
        </p>
      </div>
    </div>
  );
}
