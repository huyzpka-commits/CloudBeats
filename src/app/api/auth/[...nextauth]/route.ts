import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DropboxProvider from "next-auth/providers/dropbox";
import AzureADProvider from "next-auth/providers/azure-ad";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CloudProvider } from "@/types";

const PROVIDER_MAP: Record<string, CloudProvider> = {
  google: "google",
  dropbox: "dropbox",
  "azure-ad": "onedrive",
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    DropboxProvider({
      clientId: process.env.DROPBOX_CLIENT_ID!,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
      authorization: {
        params: { token_access_type: "offline" },
      },
    }),
    AzureADProvider({
      clientId: process.env.ONEDRIVE_CLIENT_ID!,
      clientSecret: process.env.ONEDRIVE_CLIENT_SECRET!,
      tenantId: "common",
      authorization: {
        params: {
          scope: "openid email profile offline_access Files.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account) return true;

      const provider = PROVIDER_MAP[account.provider];
      if (!provider) return true;

      try {
        const db = getDb();
        const userId = account.providerAccountId;
        const existing = await db.query.accounts.findFirst({
          where: eq(accounts.id, userId),
        });

        const accountData = {
          id: userId,
          provider,
          displayName: profile?.name ?? profile?.email ?? account.providerAccountId,
          email: profile?.email ?? "",
          accessToken: account.access_token ?? "",
          refreshToken: account.refresh_token ?? "",
          tokenExpiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000,
          status: "connected" as const,
        };

        if (existing) {
          await db.update(accounts).set(accountData).where(eq(accounts.id, userId));
        } else {
          await db.insert(accounts).values(accountData);
        }
      } catch (err) {
        console.error("[Auth] Failed to save account:", err);
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.expiresAt = account.expires_at ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.provider = token.provider as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
