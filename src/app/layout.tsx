import type { Metadata } from "next";
import "./globals.css";
import Search from "./components/search";
import { ThemeToggle } from "./components/theme-toggle";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Header from "./components/header";

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
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Search />
          <ThemeToggle />
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
