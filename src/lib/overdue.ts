import { getAllSheetBorrowRequests, updateSheetBorrowRequestStatus, BorrowRequest } from "@/lib/googleSheets";
import { sendOverdueNotification } from "@/lib/email";

/**
 * Scans all approved borrow requests, detects if their due dates have passed,
 * updates their statuses to 'overdue' in Google Sheets, and dispatches email notifications.
 * Runs as a non-blocking background task.
 */
export async function checkAndUpdateOverdueRequests(): Promise<void> {
  try {
    const requests = await getAllSheetBorrowRequests();
    const approvedRequests = requests.filter((r) => r.status.toLowerCase() === "approved");

    if (approvedRequests.length === 0) {
      return;
    }

    const now = new Date();

    for (const request of approvedRequests) {
      if (!request.dueDate) continue;

      try {
        // Parse due date: YYYY-MM-DD or YYYY-MM-DD HH:mm
        const parts = request.dueDate.split(" ");
        const ymd = parts[0].split("-");
        const dueTime = new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]));

        if (parts[1]) {
          const hm = parts[1].split(":");
          dueTime.setHours(Number(hm[0] || 0), Number(hm[1] || 0), 0, 0);
        } else {
          dueTime.setHours(23, 59, 59, 999); // default end of day
        }

        // If current time is past the due time, transition to 'overdue'
        if (now.getTime() > dueTime.getTime()) {
          console.warn(`[ALERT] Overdue Detected: Request ID ${request.id} for borrower ${request.borrowerName} has passed its due date (${request.dueDate}).`);

          // 1. Update status in Google Sheets
          const success = await updateSheetBorrowRequestStatus(request.id, "overdue");
          if (success) {
            // 2. Dispatch Email Notification to Admin
            const updatedRequest: BorrowRequest = { ...request, status: "overdue" };
            await sendOverdueNotification(updatedRequest);
            console.log(`[SUCCESS] Success: Automatically transitioned request ${request.id} to overdue status.`);
          }
        }
      } catch (dateError) {
        console.error(`[ERROR] Failed to parse or check due date for request ${request.id}:`, dateError);
      }
    }
  } catch (error) {
    console.error("[ERROR] Failed to run background overdue checks:", error);
  }
}
