import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validations/auth";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            userProfile: true,
          },
        });
        if (!user || !user.password) return null;
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;
        const displayName = [
          user.userProfile?.firstName,
          user.userProfile?.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        return {
          id: user.id,
          email: user.email,
          name: displayName || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role =
          (
            user as {
              role?: "USER" | "ADMIN" | "OWNER";
            }
          ).role ?? "USER";
        if ("name" in user && user.name != null) {
          token.name = user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? "USER";
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
});
