import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
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
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_website"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { history, vision, contact, showHistory, showVision, presidentName, presidentImage, presidentMessage, presidentPrefix } = data;

    const updateData: any = {};
    if (history !== undefined) updateData.history = String(history);
    if (vision !== undefined) updateData.vision = String(vision);
    if (contact !== undefined) updateData.contact = String(contact);
    if (showHistory !== undefined) updateData.showHistory = Boolean(showHistory);
    if (showVision !== undefined) updateData.showVision = Boolean(showVision);
    if (presidentName !== undefined) updateData.presidentName = String(presidentName);
    if (presidentImage !== undefined) updateData.presidentImage = String(presidentImage);
    if (presidentMessage !== undefined) updateData.presidentMessage = String(presidentMessage);
    if (presidentPrefix !== undefined) updateData.presidentPrefix = String(presidentPrefix);

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
