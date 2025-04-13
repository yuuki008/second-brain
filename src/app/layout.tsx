import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import Header from "./components/header";
import { Noto_Sans_JP } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

const noto_sans_jp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal knowledge management system",
  icons: {
    icon: [{ url: "/profile.jpg", type: "image/jpg" }],
    apple: "/profile.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(noto_sans_jp.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Header />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
