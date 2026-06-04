import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSheetUserByEmail, updateSheetUserProfile } from "@/lib/googleSheets";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getSheetUserByEmail(session.user.email);
    return NextResponse.json({
      name: session.user.name ?? "",
      email: session.user.email,
      // Prefer customAvatar (user-set), fallback to Google OAuth image
      image: profile?.customAvatar || session.user.image || "",
      role: session.user.role ?? "user",
      nickname: profile?.nickname ?? "",
      studentId: profile?.studentId ?? "",
      phone: profile?.phone ?? "",
      year: profile?.year ?? "",
      department: profile?.department ?? "",
      faculty: profile?.faculty ?? "",
      bio: profile?.bio ?? "",
      customAvatar: profile?.customAvatar ?? "",
      // Rank is assigned by admin (stored in column M of users sheet)
      rank: profile?.rank ?? "Member",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const allowed = ["nickname", "studentId", "phone", "year", "department", "faculty", "bio", "customAvatar"];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = String(body[key]);
    }

    await updateSheetUserProfile(session.user.email, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
