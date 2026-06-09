import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    provider: string;
  }
}

declare module "next-auth/core/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    provider: string;
    expiresAt: number;
  }
}
