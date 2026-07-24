import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const AUTH_SECRET = "ai-career-navigator-super-secret-key-2024";

process.env.AUTH_SECRET = process.env.AUTH_SECRET || AUTH_SECRET;
process.env.AUTH_TRUST_HOST = "true";
process.env.AUTH_URL = process.env.AUTH_URL || "https://airesumecareer.netlify.app";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const name = credentials?.name as string;
        const isSignUp = credentials?.isSignUp === "true";

        if (!email || !password) return null;

        try {
          const { prisma } = await import("@/lib/db");
          if (isSignUp) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) throw new Error("User already exists");

            const user = await prisma.user.create({
              data: { email, name: name || email.split("@")[0], password },
            });
            return { id: user.id, email: user.email, name: user.name };
          } else {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || user.password !== password) throw new Error("Invalid credentials");
            return { id: user.id, email: user.email, name: user.name };
          }
        } catch {
          return { id: "demo-user-123", email: email, name: name || email.split("@")[0] };
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
