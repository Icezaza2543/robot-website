import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { 
  getSheetItems, 
  appendSheetItem, 
  updateSheetItemStock, 
  updateSheetItem,
  deleteSheetItem,
  EquipmentItem 
} from "@/lib/googleSheets";

// Re-export the interface for compatibility with other files importing it from here
export type { EquipmentItem };

// ──────────────────────────────────────────────
// API Handlers
// ──────────────────────────────────────────────

/**
 * Fetch all equipment items.
 */
export async function GET() {
  try {
    const items = await getSheetItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

/**
 * Add a new equipment item (Admin only).
 */
export async function POST(request: Request) {
  // Verify Admin credentials
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name || !data.category || data.stock === undefined) {
      return NextResponse.json(
        { error: "Name, category, and stock are required fields" },
        { status: 400 }
      );
    }

    // Generate a beautiful, short, professional item ID (e.g. RB-K4F9)
    const shortId = `RB-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newItem: EquipmentItem = {
      id: shortId,
      name: String(data.name).trim(),
      category: String(data.category).trim(),
      stock: Math.max(0, Number(data.stock)),
      location: String(data.location || "General Shelf").trim(),
      description: String(data.description || "").trim(),
      imageUrl: data.imageUrl ? String(data.imageUrl).trim() : "",
    };

    const success = await appendSheetItem(newItem);
    if (!success) {
      return NextResponse.json({ error: "Failed to save item to database" }, { status: 500 });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

/**
 * Delete an equipment item (Admin only).
 */
export async function DELETE(request: Request) {
  // Verify Admin credentials
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const success = await deleteSheetItem(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete item or item not found" }, { status: 500 });
    }

    return NextResponse.json({ message: "Item deleted successfully", id });
  } catch (error) {
    console.error("Error in DELETE /api/items:", error);
    return NextResponse.json({ error: "Server error during deletion" }, { status: 500 });
  }
}

/**
 * Update stock level of an equipment item (Admin only).
 */
export async function PATCH(request: Request) {
  // Verify Admin credentials
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, stock, name, category, location, description, imageUrl } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Determine if it's a full update or just stock update
    if (name !== undefined || category !== undefined || location !== undefined || description !== undefined || imageUrl !== undefined) {
      // Full update
      const updateData: Partial<EquipmentItem> = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (category !== undefined) updateData.category = String(category).trim();
      if (stock !== undefined) updateData.stock = Math.max(0, Number(stock));
      if (location !== undefined) updateData.location = String(location).trim();
      if (description !== undefined) updateData.description = String(description).trim();
      if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();

      const success = await updateSheetItem(id, updateData);
      if (!success) {
        return NextResponse.json({ error: "Failed to update item details" }, { status: 500 });
      }
      return NextResponse.json({ id, ...updateData });
    } else if (stock !== undefined) {
      // Just stock update (backward compatibility)
      const updatedStock = Math.max(0, Number(stock));
      const success = await updateSheetItemStock(id, updatedStock);
      if (!success) {
        return NextResponse.json({ error: "Failed to update item stock" }, { status: 500 });
      }
      return NextResponse.json({ id, stock: updatedStock });
    } else {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

