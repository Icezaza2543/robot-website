import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { uploadFileToDrive } from "@/lib/googleDrive";

export async function POST(request: Request) {
  // Check admin role
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
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

    const url = await uploadFileToDrive(buffer, uniqueName, file.type);

    if (!url) {
      return NextResponse.json({ error: "Failed to upload to Google Drive" }, { status: 500 });
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
