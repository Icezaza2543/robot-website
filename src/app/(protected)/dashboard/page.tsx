import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard | Robot Club",
  description: "User dashboard for equipment borrowing",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">ยินดีต้อนรับ, {session.user?.name || session.user?.email}</p>
        </header>

        <main>
          <DashboardClient />
        </main>
      </div>
    </div>
  );
}
