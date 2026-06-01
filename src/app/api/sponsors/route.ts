import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSponsors, addSponsor, deleteSponsor } from "@/lib/googleSheets";

// GET: Fetch active sponsors (publicly accessible)
export async function GET() {
  try {
    const sponsors = await getSponsors();
    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("[ERROR] Failed to fetch sponsors:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

// POST: Add a new sponsor (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid image URL is required" }, { status: 400 });
    }

    const newSponsor = await addSponsor(url);
    if (!newSponsor) {
      return NextResponse.json({ error: "Failed to add sponsor" }, { status: 500 });
    }

    return NextResponse.json(newSponsor, { status: 201 });
  } catch (error) {
    console.error("[ERROR] Add sponsor error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove a sponsor (Admin only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sponsor ID is required" }, { status: 400 });
    }

    const success = await deleteSponsor(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete sponsor or not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ERROR] Delete sponsor error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
