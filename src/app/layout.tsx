import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Search from "./components/Search";
import { ThemeToggle } from "./components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal knowledge management system",
  icons: {
    icon: [{ url: "/brain.png", type: "image/png" }],
    apple: "/brain.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body suppressHydrationWarning className={inter.className}>
        <Search />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
