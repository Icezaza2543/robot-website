import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getNewsItems, addNewsItem, updateNewsItem, deleteNewsItem } from "@/lib/googleSheets";

export async function GET() {
  try {
    const items = await getNewsItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, date, summary, content, category, author, imageUrl, igLink } = data;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newItem = {
      title: String(title).trim(),
      date: String(date || "").trim(),
      summary: String(summary || "").trim(),
      content: String(content).trim(),
      category: String(category || "ทั่วไป").trim(),
      author: String(author || "Admin").trim(),
      imageUrl: String(imageUrl || "").trim(),
      igLink: String(igLink || "").trim(),
    };

    const success = await addNewsItem(newItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to add news to Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "News added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/news:", error);
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
    const { id, title, date, summary, content, category, author, imageUrl, igLink } = data;

    if (!id) {
      return NextResponse.json({ error: "News ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (date !== undefined) updateData.date = String(date).trim();
    if (summary !== undefined) updateData.summary = String(summary).trim();
    if (content !== undefined) updateData.content = String(content).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (author !== undefined) updateData.author = String(author).trim();
    if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
    if (igLink !== undefined) updateData.igLink = String(igLink).trim();

    const success = await updateNewsItem(id, updateData);
    if (!success) {
      return NextResponse.json({ error: "Failed to update news in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "News updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/news:", error);
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
      return NextResponse.json({ error: "News ID is required" }, { status: 400 });
    }

    const success = await deleteNewsItem(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete news in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "News deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
