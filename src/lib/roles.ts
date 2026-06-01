import { getSheetUserByEmail, appendSheetUser } from "./googleSheets";

/**
 * Centralized role resolution logic for the NU Robot Club Equipment Borrowing System.
 * 
 * Production-Ready Design:
 * 1. Attempts to query the Google Sheets database (sheet: 'users') by email.
 * 2. If the user is found in the Sheet, resolves role based on Sheets columns.
 * 3. Safe Fallback: If Google Sheets is not configured or fails, it falls back to
 *    checking the `ADMIN_EMAILS` environment variable list.
 * 4. Auto-Registration: If the user is not found in Google Sheets, and a name is provided,
 *    automatically register them in the Google Sheet, defaulting their role to "user" 
 *    (or "admin" if in the fallback ADMIN_EMAILS list).
 */

export type UserRole = "admin" | "user";

/**
 * Resolves the role of a user based on their email, and auto-registers them in the 
 * Google Sheets database if not found on first login.
 * 
 * @param email - The email address of the logged-in user.
 * @param name - Optional user display name (passed on first login).
 * @returns The user's role ("admin" or "user").
 */
export async function resolveUserRole(
  email: string | null | undefined,
  name?: string | null
): Promise<UserRole> {
  if (!email) return "user";
  
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // ── 1. Query Google Sheets Database ──
    const sheetUser = await getSheetUserByEmail(email);

    if (sheetUser) {
      console.log(`[INFO] User ${email} found in Google Sheets. Role resolved to: ${sheetUser.role}`);
      return sheetUser.role;
    }
  } catch (error) {
    console.error("[WARNING] Failed to resolve role from Google Sheets, attempting .env fallback:", error);
  }

  // ── 2. Determine Role for fallback / auto-registration ──
  let resolvedRole: UserRole = "user";
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (adminEmailsEnv) {
    const adminList = adminEmailsEnv.split(",").map(e => e.trim().toLowerCase());
    if (adminList.includes(normalizedEmail)) {
      console.log(`[INFO] User ${email} matched in .env ADMIN_EMAILS.`);
      resolvedRole = "admin";
    }
  }

  // ── 3. Auto-Register User on First Login ──
  if (name) {
    console.log(`[INFO] User ${email} not found in Google Sheets. Attempting auto-registration...`);
    try {
      await appendSheetUser({
        email: normalizedEmail,
        name: name.trim(),
        role: resolvedRole,
        status: "active",
      });
    } catch (e) {
      console.error("[WARNING] Failed to auto-register user to Google Sheets:", e);
    }
  }

  return resolvedRole;
}

