import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getSheetPresidents, addSheetPresident, updateSheetPresident, deleteSheetPresident } from "@/lib/googleSheets";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_website"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const items = await getSheetPresidents();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching presidents:", error);
    return NextResponse.json({ error: "Failed to fetch presidents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_website"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { name, year, imageUrl } = data;

    if (!name || !year) {
      return NextResponse.json({ error: "Name and year are required" }, { status: 400 });
    }

    const newItem = {
      name: String(name).trim(),
      year: String(year).trim(),
      imageUrl: String(imageUrl || "").trim(),
    };

    const success = await addSheetPresident(newItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to add president to Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "President added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/presidents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_website"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { id, name, year, imageUrl } = data;

    if (!id) {
      return NextResponse.json({ error: "President ID is required" }, { status: 400 });
    }

    const updatedItem = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(year !== undefined && { year: String(year).trim() }),
      ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
    };

    const success = await updateSheetPresident(id, updatedItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to update president in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "President updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/admin/presidents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_website"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "President ID is required" }, { status: 400 });
    }

    const success = await deleteSheetPresident(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete president in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "President deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/presidents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
