import { type DefaultSession } from "next-auth";
import { type JWT as DefaultJWT } from "next-auth/jwt";
export type UserRole = "USER" | "ADMIN" | "OWNER";
declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
  }
}
