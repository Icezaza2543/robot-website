import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getAllSheetBorrowRequests,
  updateSheetBorrowRequestStatus,
  getSheetItems,
  updateSheetItemStock
} from "@/lib/googleSheets";
import { sendReturnConfirmedNotification, sendLowStockNotification } from "@/lib/email";
import { checkAndUpdateOverdueRequests } from "@/lib/overdue";

/**
 * GET Handler: Fetch All Borrow Requests (Admin Only)
 */
export async function GET(request: Request) {
  // 1. Authenticate & Verify Role
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_requests"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 401 });
    }
  }

  try {
    // Non-blocking background scan for overdue items
    checkAndUpdateOverdueRequests().catch((err) =>
      console.error("Failed to run background overdue checks:", err)
    );

    const requests = await getAllSheetBorrowRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error in GET /api/admin/borrow:", error);
    return NextResponse.json({ error: "Failed to fetch all borrow requests" }, { status: 500 });
  }
}

/**
 * PATCH Handler: Approve, Reject, Return or Update Borrow Request Status (Admin Only)
 */
export async function PATCH(request: Request) {
  // 1. Authenticate & Verify Role
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_requests"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { id, status, adminNote } = data;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id and status are required." }, { status: 400 });
    }

    // 2. Query target request to get current state & items list
    const requests = await getAllSheetBorrowRequests();
    const targetRequest = requests.find((r) => r.id === id);

    if (!targetRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const previousStatus = targetRequest.status.toLowerCase();
    const newStatus = status.toLowerCase();

    // Parse requested items list
    let requestItems: any[] = [];
    try {
      requestItems = JSON.parse(targetRequest.items);
    } catch (e) {
      console.error(`Failed to parse items for request ${id}:`, e);
    }

    // 3. Automated Stock Handlers based on state transitions
    if (newStatus === "approved" && previousStatus === "pending") {
      // DEDUCT STOCK
      // A. Fetch current items stock levels
      const currentItems = await getSheetItems();

      // B. Dry Run Check: Verify all items have sufficient stock
      for (const reqItem of requestItems) {
        const matchingItem = currentItems.find((ci) => ci.id === reqItem.id);
        if (!matchingItem) {
          return NextResponse.json(
            { error: `ไม่พบอุปกรณ์รหัส ${reqItem.id} (${reqItem.name}) ในฐานข้อมูลคลัง` },
            { status: 400 }
          );
        }
        if (matchingItem.stock < reqItem.quantity) {
          return NextResponse.json(
            {
              error: `ไม่สามารถอนุมัติได้เนื่องจากอุปกรณ์ "${reqItem.name}" ในคลังมีไม่เพียงพอ (คงเหลือ ${matchingItem.stock} ชิ้น, ต้องการ ${reqItem.quantity} ชิ้น)`
            },
            { status: 400 }
          );
        }
      }

      // C. Apply Stock Deductions
      for (const reqItem of requestItems) {
        const matchingItem = currentItems.find((ci) => ci.id === reqItem.id)!;
        const newStock = matchingItem.stock - reqItem.quantity;
        await updateSheetItemStock(reqItem.id, newStock);

        // Trigger low stock warning (stock falls below or equal to 3)
        if (newStock <= 3) {
          sendLowStockNotification(matchingItem, newStock).catch((err) =>
            console.error("Failed to send low stock notification email in background:", err)
          );
        }
      }
    } else if (
      newStatus === "returned" &&
      (previousStatus === "approved" || previousStatus === "return_pending" || previousStatus === "overdue")
    ) {
      // RESTORE STOCK
      const currentItems = await getSheetItems();

      for (const reqItem of requestItems) {
        const matchingItem = currentItems.find((ci) => ci.id === reqItem.id);
        if (matchingItem) {
          const newStock = matchingItem.stock + reqItem.quantity;
          await updateSheetItemStock(reqItem.id, newStock);
        }
      }
    }

    // 4. Determine ReturnDate if returned
    let returnDate: string | undefined = undefined;
    if (newStatus === "returned") {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      returnDate = `${yyyy}-${mm}-${dd}`;
    }

    // 5. Update status in Google Sheets
    const success = await updateSheetBorrowRequestStatus(id, newStatus, adminNote, returnDate);

    if (!success) {
      return NextResponse.json({ error: "Failed to write updates to Google Sheets" }, { status: 500 });
    }

    // Trigger Email Notification in background if return is confirmed
    if (newStatus === "returned" && targetRequest) {
      const updatedRequest = { ...targetRequest, status: "returned", returnDate: returnDate || "" };
      sendReturnConfirmedNotification(updatedRequest).catch((err) =>
        console.error("Failed to send return confirmed email in background:", err)
      );
    }

    return NextResponse.json({
      message: "Successfully updated borrow request status",
      id,
      status: newStatus,
      adminNote,
      returnDate
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/borrow:", error);
    return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
  }
}
