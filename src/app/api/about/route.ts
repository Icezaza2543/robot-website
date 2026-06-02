import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAboutInfo, updateAboutInfo } from "@/lib/googleSheets";

export async function GET() {
  try {
    const info = await getAboutInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error("Error fetching about info:", error);
    return NextResponse.json({ error: "Failed to fetch about info" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { history, vision, contact } = data;

    const updateData: any = {};
    if (history !== undefined) updateData.history = String(history);
    if (vision !== undefined) updateData.vision = String(vision);
    if (contact !== undefined) updateData.contact = String(contact);

    const success = await updateAboutInfo(updateData);
    if (!success) {
      return NextResponse.json({ error: "Failed to update about info in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "About info updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/about:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
