import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;
  const permissions = (session.user as any)?.permissions || [];
  const hasAdminAccess = role === "admin" || permissions.some((p: string) => p.startsWith("manage_") || p === "*");

  if (hasAdminAccess) {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}
