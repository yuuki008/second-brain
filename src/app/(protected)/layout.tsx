import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Hero from "./components/hero";
import prisma from "@/lib/prisma";
import SetupUsernameForm from "./components/setup-username-form";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
