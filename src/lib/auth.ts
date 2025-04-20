import {
  DefaultSession,
  DefaultUser,
  NextAuthOptions,
  Session,
  User as NextAuthUser,
  User,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { AdapterUser } from "next-auth/adapters";

// NextAuth の型を拡張して username と id を含める
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    username?: string | null;
  }
}

declare module "next-auth/adapters" {
  /** The AdapterUser type extends the User type from next-auth */
  interface AdapterUser extends NextAuthUser {
    username?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // session コールバックで user オブジェクトに id と username を追加
    async session({
      session,
      user,
    }: {
      session: Session;
      user: AdapterUser | User;
    }) {
      if (session.user) {
        session.user.id = user.id; // AdapterUser or User will have id
        // AdapterUserから直接usernameを取得するか、なければDBから取得
        session.user.username =
          user.username ??
          (await prisma.user.findUnique({ where: { id: user.id } }))?.username;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// export default NextAuth(authOptions); // pages router 向け
// App Router の場合、API Route を作成する必要がある
