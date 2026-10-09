import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/config';

const providers = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.hashedPassword) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

const googleClientId =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

const githubClientId =
  process.env.AUTH_GITHUB_ID ||
  process.env.GITHUB_CLIENT_ID ||
  process.env.GITHUB_ID;
const githubClientSecret =
  process.env.AUTH_GITHUB_SECRET ||
  process.env.GITHUB_CLIENT_SECRET ||
  process.env.GITHUB_SECRET;

if (githubClientId && githubClientSecret) {
  providers.push(
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: authConfig.signInPage,
    error: authConfig.signInPage,
  },
  providers,
  events: {
    async createUser({ user }) {
      try {
        await prisma.profile.create({
          data: {
            userId: user.id,
          },
        });
      } catch {
        // Ignore if already created or existing
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role || 'CANDIDATE';
        token.id = user.id;
        try {
          const setting = await prisma.systemSetting.findUnique({
            where: { key: `user_theme_${user.id}` },
          });
          token.theme = setting?.value === 'dark' ? 'dark' : 'light';
        } catch {
          token.theme = 'light';
        }
      }

      // Robust fallback if token role or id are missing
      if ((!token.role || !token.id) && token.sub) {
        token.id = token.id || token.sub;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          token.role = dbUser?.role || 'CANDIDATE';
        } catch {
          token.role = token.role || 'CANDIDATE';
        }
      }

      if (trigger === 'update' && session?.theme) {
        token.theme = session.theme;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.role = token.role || 'CANDIDATE';
        session.user.id = token.id || token.sub;
        session.user.theme = token.theme || 'light';
        if (token.picture && !session.user.image) {
          session.user.image = token.picture;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (user?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { status: true },
          });
          if (dbUser?.status === 'SUSPENDED') {
            return false;
          }
        } catch {
          // Continue if DB check fails
        }
      }

      // Require a valid email address for OAuth providers (Google, GitHub)
      if (account?.provider === 'github' || account?.provider === 'google') {
        if (!user?.email) {
          console.error(
            `OAuth login rejected: No email associated with ${account.provider} profile`
          );
          return false;
        }
      }

      // Allow OAuth sign-in without email verification
      if (account?.provider !== 'credentials') return true;

      // For credentials, check if user exists
      if (!user?.id) return false;

      return true;
    },
  },
});

