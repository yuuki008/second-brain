import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Search from "./components/Search";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal knowledge management system",
  icons: {
    icon: [{ url: "/brain-dark.png", type: "image/png" }],
    apple: "/brain-dark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Search />
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
