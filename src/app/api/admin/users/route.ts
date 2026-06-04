import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers, updateUserRoleAndRank } from "@/lib/googleSheets";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_users"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_users"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const { email, role, rank } = body;

    if (!email || !role || !rank) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Protect super admin changes (optional safety)
    if (email === "nurobotclub@gmail.com") {
      return NextResponse.json({ error: "Cannot change role of super admin" }, { status: 403 });
    }

    const success = await updateUserRoleAndRank(email, role, rank);
    if (!success) {
      return NextResponse.json({ error: "Failed to update user in sheets" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
