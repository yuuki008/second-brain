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
      <div className="text-center font-medium text-base">
        <p>404 error, page not found</p>
        <p>
          click{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            here
          </Link>{" "}
          to go back to the home page
        </p>
      </div>
    </div>
  );
}
