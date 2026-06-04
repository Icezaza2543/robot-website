import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRolePermissions } from "@/lib/permissions";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;
  // Get permissions directly from the roles database helper
  const permissions = await getRolePermissions(role);
  
  // They are considered an admin user if they have any manage_* permission or the wildcard *
  const hasAdminAccess = permissions.some((p: string) => p.startsWith("manage_") || p === "*");

  if (hasAdminAccess) {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}
