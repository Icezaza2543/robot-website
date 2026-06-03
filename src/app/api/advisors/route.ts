import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdvisors, addAdvisor, deleteAdvisor, updateAdvisor } from "@/lib/googleSheets";

export async function GET() {
  try {
    const items = await getAdvisors();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching advisors:", error);
    return NextResponse.json({ error: "Failed to fetch advisors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, role, imageUrl, prefix } = data;

    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const newItem = {
      name: String(name).trim(),
      role: String(role).trim(),
      imageUrl: String(imageUrl || "").trim(),
      prefix: String(prefix || "").trim(),
    };

    const success = await addAdvisor(newItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to add advisor to Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Advisor added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/advisors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, name, role, imageUrl, prefix } = data;

    if (!id) {
      return NextResponse.json({ error: "Advisor ID is required" }, { status: 400 });
    }

    const updatedItem = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(role !== undefined && { role: String(role).trim() }),
      ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
      ...(prefix !== undefined && { prefix: String(prefix).trim() }),
    };

    const success = await updateAdvisor(id, updatedItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to update advisor in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Advisor updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/advisors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Advisor ID is required" }, { status: 400 });
    }

    const success = await deleteAdvisor(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete advisor in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Advisor deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/advisors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
