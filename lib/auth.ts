import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or NTN", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const loginId = credentials.email.trim();
        let user;

        if (loginId.includes("@")) {
          // Login by Email
          user = await prisma.user.findUnique({
            where: { email: loginId },
            include: { businessUnit: true },
          });
        } else {
          // Login by NTN
          const bu = await prisma.businessUnit.findFirst({
            where: { ntn: loginId },
            include: { users: true }
          });
          if (bu && bu.users && bu.users.length > 0) {
            // Find the primary user (admin) for this BusinessUnit
            user = { ...bu.users[0], businessUnit: bu };
          }
        }

        if (!user || !user.passwordHash) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        if (user.role === "TENANT" && user.businessUnit && !user.businessUnit.isActive) {
          throw new Error("Your account has been suspended. Please contact the administrator.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessUnitId: user.businessUnitId,
          forcePasswordChange: user.forcePasswordChange,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
        token.businessUnitId = user.businessUnitId;
        token.forcePasswordChange = (user as any).forcePasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.businessUnitId = token.businessUnitId as string | null;
        (session.user as any).forcePasswordChange = token.forcePasswordChange;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
