import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { resolveUserRole } from "./roles";
import { getRolePermissions } from "./permissions";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },

  callbacks: {
    /**
     * Called whenever a JWT is created or updated.
     * Delegates role assignment to our central resolveUserRole helper.
     */
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.role = await resolveUserRole(user.email, user.name);
        token.permissions = await getRolePermissions(token.role);
      }
      return token;
    },

    /**
     * Called whenever session is verified.
     * Exposes the role stored in the JWT to the frontend session context.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
};

// ──────────────────────────────────────────────
// Reusable Server-Side Session Helpers
// ──────────────────────────────────────────────

/**
 * Returns the full getServerSession object.
 * Suitable for usage in Server Components, Route Handlers, and Server Actions.
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * Returns the current authenticated user's session data, or null.
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Ensures the user is logged in. If not, redirects them to the login page.
 * Returns the user session data if authenticated.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Ensures the logged-in user is an admin. If not, redirects them to /equipment.
 * Returns the user session data if authorized as admin.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/equipment");
  }
  return user;
}
