import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToImgbb } from "@/lib/imgbb";

import { hasPermission } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const role = session.user.role;
  const canUpload = 
    role === "admin" || 
    (await hasPermission(role, "manage_news")) ||
    (await hasPermission(role, "manage_items")) ||
    (await hasPermission(role, "manage_website")) ||
    (await hasPermission(role, "manage_rooms"));

  if (!canUpload) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique name
    const ext = file.name.split('.').pop() || "bin";
    const uniqueName = `upload-${Date.now()}.${ext}`;

    const url = await uploadFileToImgbb(buffer, uniqueName);

    if (!url) {
      return NextResponse.json({ error: "Failed to upload to ImgBB (Ensure IMGBB_API_KEY is set)" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error.message || String(error) 
      }, 
      { status: 500 }
    );
  }
}
