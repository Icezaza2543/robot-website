import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRoles, saveRole, deleteRole } from "@/lib/googleSheets";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_roles"))) {
    // Note: the built-in "admin" role automatically has all permissions.
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_roles"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const { roleName, rank, permissions } = body;

    if (!roleName || !rank) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = await saveRole(roleName, rank, permissions || "");
    if (!success) throw new Error("Failed to save to sheets");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_roles"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const roleName = searchParams.get("roleName");

    if (!roleName) {
      return NextResponse.json({ error: "Missing role name" }, { status: 400 });
    }

    if (roleName.toLowerCase() === "admin" || roleName.toLowerCase() === "user") {
      return NextResponse.json({ error: "Cannot delete built-in roles" }, { status: 400 });
    }

    const success = await deleteRole(roleName);
    if (!success) throw new Error("Failed to delete from sheets");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
