import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ZenProvider } from "@/components/providers/zen-provider";
import Header from "./components/header";
import { Noto_Sans_JP } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import RightFooter from "./components/right-footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { getServerSession } from "next-auth";
import Hero from "./components/hero";
import prisma from "@/lib/prisma";
import SetupUsernameForm from "./components/setup-username-form";
import { authOptions } from "@/lib/auth";

const noto_sans_jp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) return <Hero />;

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user?.username) return <SetupUsernameForm userId={session.user.id} />;

  return <>{children}</>;
}

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
        <NextAuthProvider>
          <TooltipProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ZenProvider>
                <Header />
                <ProtectedLayout>{children}</ProtectedLayout>
                <Toaster />
                <RightFooter />
              </ZenProvider>
            </ThemeProvider>
          </TooltipProvider>
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
