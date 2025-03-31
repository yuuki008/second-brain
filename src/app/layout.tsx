import type { Metadata } from "next";
import "./globals.css";
import Search from "./components/search";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import Header from "./components/header";
import { Shippori_Mincho_B1 } from "next/font/google";

const shipporiMincho = Shippori_Mincho_B1({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal knowledge management system",
  icons: {
    icon: [{ url: "/grinning-brain.png", type: "image/png" }],
    apple: "/grinning-brain.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className={shipporiMincho.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Search />
            <Header />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
