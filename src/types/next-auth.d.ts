import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    permissions?: string[];
  }
}
