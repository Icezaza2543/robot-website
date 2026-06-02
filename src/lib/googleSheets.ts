import { google } from "googleapis";
import { UserRole } from "./roles";

export interface SheetUser {
  email: string;
  name: string;
  role: UserRole;
  status: string;
}

/**
 * Initializes and returns a Google Sheets API client authenticated with
 * a Service Account JWT.
 * 
 * Safe Fallback: Returns null if credentials are not configured,
 * preventing server startup failures.
 */
function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn("[WARNING] Google Sheets API credentials are not fully configured in environment variables.");
    return null;
  }

  try {
    // Format the private key to handle literal \n sequences correctly
    const formattedKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email,
      key: formattedKey,
      scopes:["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
  } catch (error) {
    console.error("[ERROR] Failed to initialize Google Sheets Auth Client:", error);
    return null;
  }
}

/**
 * Fetches user data from the 'users' tab in Google Sheets by email.
 * 
 * Sheet Columns mapping (assumed):
 * Column A: email
 * Column B: name
 * Column C: role (admin | user)
 * Column D: status (active | pending | suspended)
 * 
 * @param email - The email to lookup.
 * @returns The SheetUser details if found, otherwise null.
 */
export async function getSheetUserByEmail(email: string): Promise<SheetUser | null> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    return null;
  }

  try {
    // Retrieve values from the 'users' sheet
    // Assumes A2:D1000 range containing: Email, Name, Role, Status
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "users!A2:D1000",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.warn("[INFO] No rows or users found in Google Sheets 'users' sheet.");
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Loop through rows to find matching email (Column A / Index 0)
    for (const row of rows) {
      const rowEmail = String(row[0] || "").trim().toLowerCase();

      if (rowEmail === normalizedEmail) {
        const roleStr = String(row[2] || "").trim().toLowerCase();
        
        // Ensure role is normalized to "admin" or "user"
        const role: UserRole = roleStr === "admin" ? "admin" : "user";

        return {
          email: rowEmail,
          name: String(row[1] || "").trim(),
          role,
          status: String(row[3] || "active").trim().toLowerCase(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`[ERROR] Error fetching user ${email} from Google Sheets:`, error);
    return null;
  }
}

/**
 * Appends a new user row to the 'users' sheet in Google Sheets.
 * 
 * @param user - The user details to write.
 */
export async function appendSheetUser(user: SheetUser): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot append user.");
    return false;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "users!A2:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[user.email, user.name, user.role, user.status]],
      },
    });
    console.log(`[SUCCESS] Successfully appended user ${user.email} to Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to append user ${user.email} to Google Sheets:`, error);
    return false;
  }
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  description: string;
  imageUrl?: string;
}

/**
 * Helper to get a beautiful, concise local timestamp (e.g. "2026-05-28 18:25")
 */
function getShortTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

async function ensureSheetExists(sheets: any, sheetId: string, title: string, headers: string[]): Promise<void> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetExists = spreadsheet.data.sheets?.some(
      (s: any) => s.properties?.title?.toLowerCase() === title.toLowerCase()
    );

    if (!sheetExists) {
      console.log(`[INFO] Sheet '${title}' does not exist. Creating...`);
      const createResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });

      const targetSheetId = createResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${title}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });

      if (targetSheetId !== undefined && targetSheetId !== null) {
        console.log(`[INFO] Formatting newly created sheet '${title}' (ID: ${targetSheetId})...`);
        const requests: any[] = [
          // 1. Freeze the first row
          {
            updateSheetProperties: {
              properties: {
                sheetId: targetSheetId,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: "gridProperties.frozenRowCount"
            }
          },
          // 2. Format row 1 (headers): Deep Slate background, White bold text, Center aligned
          {
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 30 / 255,
                    green: 41 / 255,
                    blue: 59 / 255
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 11,
                    bold: true,
                    fontFamily: "Arial"
                  },
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE"
                }
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
            }
          },
          // 3. Set header row height to roomy 38px
          {
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: "ROWS",
                startIndex: 0,
                endIndex: 1
              },
              properties: {
                pixelSize: 38
              },
              fields: "pixelSize"
            }
          },
          // 4. Double bottom border on headers row in beautiful orange color
          {
            updateBorders: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              bottom: {
                style: "DOUBLE",
                color: {
                  red: 249 / 255,
                  green: 115 / 255,
                  blue: 22 / 255
                }
              }
            }
          }
        ];

        // 5. Set specific column widths
        let colWidths: number[] = [];
        if (title.toLowerCase() === "items") {
          colWidths = [120, 220, 150, 90, 160, 280, 180, 180];
        } else if (title.toLowerCase() === "users") {
          colWidths = [220, 180, 110, 110, 180];
        } else if (title.toLowerCase() === "borrow_requests") {
          colWidths = [120, 150, 150, 200, 150, 130, 250, 120, 120, 120, 220, 100, 200, 160, 160];
        } else {
          colWidths = Array(headers.length).fill(150);
        }

        colWidths.forEach((width, idx) => {
          requests.push({
            updateDimensionProperties: {
              range: {
                sheetId: targetSheetId,
                dimension: "COLUMNS",
                startIndex: idx,
                endIndex: idx + 1
              },
              properties: {
                pixelSize: width
              },
              fields: "pixelSize"
            }
          });
        });

        // 6. Align and Style specific columns for items
        if (title.toLowerCase() === "items") {
          // Stock Column (Column D / Index 3): Center align
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 3,
                endColumnIndex: 4
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE"
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment)"
            }
          });

          // Date columns G and H: Center align and style as slightly muted text
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 6,
                endColumnIndex: 8
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                  textFormat: {
                    foregroundColor: {
                      red: 100 / 255,
                      green: 116 / 255,
                      blue: 139 / 255
                    },
                    fontSize: 9
                  }
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)"
            }
          });

          // 7. Add Conditional Formatting for Stock levels
          // Rule 1: Out of Stock (Stock === 0)
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 3,
                  endColumnIndex: 4
                }],
                booleanRule: {
                  condition: {
                    type: "NUMBER_EQ",
                    values: [{ userEnteredValue: "0" }]
                  },
                  format: {
                    backgroundColor: { red: 254 / 255, green: 242 / 255, blue: 242 / 255 },
                    textFormat: { foregroundColor: { red: 153 / 255, green: 27 / 255, blue: 27 / 255 }, bold: true }
                  }
                }
              },
              index: 0
            }
          });

          // Rule 2: Low Stock (Stock between 1 and 5)
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 3,
                  endColumnIndex: 4
                }],
                booleanRule: {
                  condition: {
                    type: "NUMBER_BETWEEN",
                    values: [{ userEnteredValue: "1" }, { userEnteredValue: "5" }]
                  },
                  format: {
                    backgroundColor: { red: 254 / 255, green: 243 / 255, blue: 199 / 255 },
                    textFormat: { foregroundColor: { red: 146 / 255, green: 64 / 255, blue: 14 / 255 }, bold: true }
                  }
                }
              },
              index: 1
            }
          });

          // Rule 3: High Stock (Stock > 5)
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 3,
                  endColumnIndex: 4
                }],
                booleanRule: {
                  condition: {
                    type: "NUMBER_GREATER",
                    values: [{ userEnteredValue: "5" }]
                  },
                  format: {
                    backgroundColor: { red: 240 / 255, green: 253 / 255, blue: 244 / 255 },
                    textFormat: { foregroundColor: { red: 22 / 255, green: 101 / 255, blue: 52 / 255 }, bold: true }
                  }
                }
              },
              index: 2
            }
          });
        }

        if (title.toLowerCase() === "borrow_requests") {
          // ID Column (A / Index 0): Center align
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 0,
                endColumnIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE"
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment)"
            }
          });

          // Dates Column (BorrowDate H / 7, DueDate I / 8, ReturnDate J / 9): Center align
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 7,
                endColumnIndex: 10
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE"
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment)"
            }
          });

          // Status Column (L / Index 11): Center align
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 11,
                endColumnIndex: 12
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE"
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment)"
            }
          });

          // Timestamps Columns (CreatedAt N / 13, UpdatedAt O / 14): Muted center
          requests.push({
            repeatCell: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: 13,
                endColumnIndex: 15
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                  textFormat: {
                    foregroundColor: {
                      red: 100 / 255,
                      green: 116 / 255,
                      blue: 139 / 255
                    },
                    fontSize: 9
                  }
                }
              },
              fields: "userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)"
            }
          });

          // Status Conditional Format Rules
          // pending -> Yellow
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "pending" }]
                  },
                  format: {
                    backgroundColor: { red: 254 / 255, green: 243 / 255, blue: 199 / 255 },
                    textFormat: { foregroundColor: { red: 146 / 255, green: 64 / 255, blue: 14 / 255 }, bold: true }
                  }
                }
              },
              index: 0
            }
          });

          // approved -> Green
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "approved" }]
                  },
                  format: {
                    backgroundColor: { red: 240 / 255, green: 253 / 255, blue: 244 / 255 },
                    textFormat: { foregroundColor: { red: 22 / 255, green: 101 / 255, blue: 52 / 255 }, bold: true }
                  }
                }
              },
              index: 1
            }
          });

          // rejected -> Red
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "rejected" }]
                  },
                  format: {
                    backgroundColor: { red: 254 / 255, green: 242 / 255, blue: 242 / 255 },
                    textFormat: { foregroundColor: { red: 153 / 255, green: 27 / 255, blue: 27 / 255 }, bold: true }
                  }
                }
              },
              index: 2
            }
          });

          // returned -> Blue
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "returned" }]
                  },
                  format: {
                    backgroundColor: { red: 239 / 255, green: 246 / 255, blue: 255 / 255 },
                    textFormat: { foregroundColor: { red: 30 / 255, green: 64 / 255, blue: 175 / 255 }, bold: true }
                  }
                }
              },
              index: 3
            }
          });

          // overdue -> Purple
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "overdue" }]
                  },
                  format: {
                    backgroundColor: { red: 253 / 255, green: 244 / 255, blue: 255 / 255 },
                    textFormat: { foregroundColor: { red: 107 / 255, green: 33 / 255, blue: 168 / 255 }, bold: true }
                  }
                }
              },
              index: 4
            }
          });

          // return_pending -> Teal
          requests.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: targetSheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 11,
                  endColumnIndex: 12
                }],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "return_pending" }]
                  },
                  format: {
                    backgroundColor: { red: 204 / 255, green: 251 / 255, blue: 241 / 255 },
                    textFormat: { foregroundColor: { red: 17 / 255, green: 94 / 255, blue: 89 / 255 }, bold: true }
                  }
                }
              },
              index: 5
            }
          });
        }

        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: { requests }
        });
      }

      console.log(`[SUCCESS] Sheet '${title}' created and formatted successfully with headers.`);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to ensure sheet '${title}' exists:`, error);
  }
}

/**
 * Fetches all equipment items from the 'items' sheet in Google Sheets.
 */
export async function getSheetItems(): Promise<EquipmentItem[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.warn("[WARNING] Google Sheets client is not configured. Returning empty items array.");
    return [];
  }

  try {
    const headers = ["ID", "Name", "Category", "Stock", "Location", "Description", "CreatedAt", "UpdatedAt", "ImageUrl"];
    await ensureSheetExists(sheets, sheetId, "items", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "items!A2:I1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      category: String(row[2] || ""),
      stock: Number(row[3] || 0),
      location: String(row[4] || ""),
      description: String(row[5] || ""),
      imageUrl: String(row[8] || ""),
    })).filter(item => item.id !== ""); // Filter out empty rows if any
  } catch (error) {
    console.error("[ERROR] Failed to fetch items from Google Sheets:", error);
    return [];
  }
}

/**
 * Appends a new equipment item to the 'items' sheet in Google Sheets.
 */
export async function appendSheetItem(item: EquipmentItem): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot append item.");
    return false;
  }

  try {
    const headers = ["ID", "Name", "Category", "Stock", "Location", "Description", "CreatedAt", "UpdatedAt", "ImageUrl"];
    await ensureSheetExists(sheets, sheetId, "items", headers);

    const now = getShortTimestamp();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "items!A2:I",
      valueInputOption: "RAW",
      requestBody: {
        values: [[item.id, item.name, item.category, item.stock, item.location, item.description, now, now, item.imageUrl || ""]],
      },
    });

    console.log(`[SUCCESS] Successfully appended item ${item.name} (${item.id}) to Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to append item ${item.id} to Google Sheets:`, error);
    return false;
  }
}

/**
 * Updates the stock of an equipment item in the 'items' sheet.
 */
export async function updateSheetItemStock(id: string, stock: number): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot update item stock.");
    return false;
  }

  try {
    // 1. Fetch only the ID column to find the correct row index quickly
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "items!A2:A1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn("[WARNING] No rows found in 'items' sheet. Cannot update stock.");
      return false;
    }

    const normalizedId = id.trim();
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0] || "").trim() === normalizedId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.error(`[ERROR] Item with ID ${id} not found in Google Sheets.`);
      return false;
    }

    // Google Sheets is 1-indexed and header row is row 1, so data starts at A2.
    // Therefore, index 0 is row 2. Row number is rowIndex + 2.
    const rowNum = rowIndex + 2;
    const now = getShortTimestamp();

    // 2. Update stock (Column D) and updatedAt (Column H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `items!D${rowNum}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[stock]],
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `items!H${rowNum}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[now]],
      },
    });

    console.log(`[SUCCESS] Successfully updated item ${id} stock to ${stock} in Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to update item ${id} stock in Google Sheets:`, error);
    return false;
  }
}

/**
 * Updates full details of an equipment item in the 'items' sheet.
 */
export async function updateSheetItem(id: string, data: Partial<EquipmentItem>): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) return false;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "items!A2:A1000",
    });

    const rows = response.data.values;
    if (!rows) return false;

    const normalizedId = id.trim();
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0] || "").trim() === normalizedId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return false;

    const rowNum = rowIndex + 2;
    const now = getShortTimestamp();

    // Determine what to update
    // Columns: A=ID, B=Name, C=Category, D=Stock, E=Location, F=Description, G=CreatedAt, H=UpdatedAt
    // Update B to F
    if (data.name !== undefined || data.category !== undefined || data.stock !== undefined || data.location !== undefined || data.description !== undefined) {
      // Since we need to update a contiguous range B:F or just individual cells,
      // it's easier to fetch the original row first to preserve missing fields, or just assume data contains all fields if it's a full edit.
      // To be safe, fetch the row first:
      const rowResp = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `items!B${rowNum}:F${rowNum}`
      });
      
      const existing = rowResp.data.values?.[0] || ["", "", "0", "", ""];
      const newName = data.name !== undefined ? data.name : existing[0];
      const newCategory = data.category !== undefined ? data.category : existing[1];
      const newStock = data.stock !== undefined ? data.stock : existing[2];
      const newLocation = data.location !== undefined ? data.location : existing[3];
      const newDesc = data.description !== undefined ? data.description : existing[4];

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `items!B${rowNum}:F${rowNum}`,
        valueInputOption: "RAW",
        requestBody: { values: [[newName, newCategory, newStock, newLocation, newDesc]] }
      });
    }

    // Update timestamp
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `items!H${rowNum}`,
      valueInputOption: "RAW",
      requestBody: { values: [[now]] }
    });

    // Update Image URL if provided
    if (data.imageUrl !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `items!I${rowNum}`,
        valueInputOption: "RAW",
        requestBody: { values: [[data.imageUrl]] }
      });
    }

    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to update item ${id}:`, error);
    return false;
  }
}

/**
 * Deletes an equipment item by ID by clearing and rewriting the table (excluding deleted item).
 */
export async function deleteSheetItem(id: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot delete item.");
    return false;
  }

  try {
    // 1. Retrieve all items (including headers and timestamps)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "items!A2:H1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn("[WARNING] No rows found in 'items' sheet. Nothing to delete.");
      return false;
    }

    const normalizedId = id.trim();
    const filteredRows = rows.filter((row) => String(row[0] || "").trim() !== normalizedId);

    if (rows.length === filteredRows.length) {
      console.warn(`[WARNING] Item with ID ${id} not found in Google Sheets for deletion.`);
      return false;
    }

    // 2. Clear the entire table range
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "items!A2:H1000",
    });

    // 3. Rewrite the filtered rows back to the sheet
    if (filteredRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "items!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: filteredRows,
        },
      });
    }

    console.log(`[SUCCESS] Successfully deleted item ${id} from Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to delete item ${id} from Google Sheets:`, error);
    return false;
  }
}

export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  borrowerName: string;
  borrowerPhone: string;
  items: string; // JSON string of items
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  note: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appends a new borrow request to the 'borrow_requests' sheet in Google Sheets.
 */
export async function appendBorrowRequest(request: BorrowRequest): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot append borrow request.");
    return false;
  }

  try {
    const headers = [
      "ID",
      "UserID",
      "UserName",
      "UserEmail",
      "BorrowerName",
      "BorrowerPhone",
      "Items",
      "BorrowDate",
      "DueDate",
      "ReturnDate",
      "Note",
      "Status",
      "AdminNote",
      "CreatedAt",
      "UpdatedAt",
    ];
    await ensureSheetExists(sheets, sheetId, "borrow_requests", headers);

    const now = getShortTimestamp();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "borrow_requests!A2:O",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            request.id,
            request.userId,
            request.userName,
            request.userEmail,
            request.borrowerName,
            request.borrowerPhone,
            request.items,
            request.borrowDate,
            request.dueDate,
            request.returnDate,
            request.note,
            request.status,
            request.adminNote,
            now,
            now,
          ],
        ],
      },
    });

    console.log(`[SUCCESS] Successfully appended borrow request ${request.id} to Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to append borrow request ${request.id} to Google Sheets:`, error);
    return false;
  }
}

/**
 * Fetches all borrow requests from the 'borrow_requests' sheet for a specific user.
 */
export async function getSheetBorrowRequestsByUser(email: string): Promise<BorrowRequest[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.warn("[WARNING] Google Sheets client is not configured. Returning empty requests.");
    return [];
  }

  try {
    const headers = [
      "ID",
      "UserID",
      "UserName",
      "UserEmail",
      "BorrowerName",
      "BorrowerPhone",
      "Items",
      "BorrowDate",
      "DueDate",
      "ReturnDate",
      "Note",
      "Status",
      "AdminNote",
      "CreatedAt",
      "UpdatedAt",
    ];
    await ensureSheetExists(sheets, sheetId, "borrow_requests", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "borrow_requests!A2:O1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Loop through rows, parse and filter by userEmail (Column D / Index 3)
    return rows
      .map((row) => ({
        id: String(row[0] || ""),
        userId: String(row[1] || ""),
        userName: String(row[2] || ""),
        userEmail: String(row[3] || ""),
        borrowerName: String(row[4] || ""),
        borrowerPhone: String(row[5] || ""),
        items: String(row[6] || "[]"),
        borrowDate: String(row[7] || ""),
        dueDate: String(row[8] || ""),
        returnDate: String(row[9] || ""),
        note: String(row[10] || ""),
        status: String(row[11] || "pending"),
        adminNote: String(row[12] || ""),
        createdAt: String(row[13] || ""),
        updatedAt: String(row[14] || ""),
      }))
      .filter((req) => req.id !== "" && req.userEmail.trim().toLowerCase() === normalizedEmail);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch borrow requests for user ${email} from Google Sheets:`, error);
    return [];
  }
}

/**
 * Fetches all borrow requests from the 'borrow_requests' sheet (for Admin).
 */
export async function getAllSheetBorrowRequests(): Promise<BorrowRequest[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.warn("[WARNING] Google Sheets client is not configured. Returning empty requests.");
    return [];
  }

  try {
    const headers = [
      "ID",
      "UserID",
      "UserName",
      "UserEmail",
      "BorrowerName",
      "BorrowerPhone",
      "Items",
      "BorrowDate",
      "DueDate",
      "ReturnDate",
      "Note",
      "Status",
      "AdminNote",
      "CreatedAt",
      "UpdatedAt",
    ];
    await ensureSheetExists(sheets, sheetId, "borrow_requests", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "borrow_requests!A2:O1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows
      .map((row) => ({
        id: String(row[0] || ""),
        userId: String(row[1] || ""),
        userName: String(row[2] || ""),
        userEmail: String(row[3] || ""),
        borrowerName: String(row[4] || ""),
        borrowerPhone: String(row[5] || ""),
        items: String(row[6] || "[]"),
        borrowDate: String(row[7] || ""),
        dueDate: String(row[8] || ""),
        returnDate: String(row[9] || ""),
        note: String(row[10] || ""),
        status: String(row[11] || "pending"),
        adminNote: String(row[12] || ""),
        createdAt: String(row[13] || ""),
        updatedAt: String(row[14] || ""),
      }))
      .filter((req) => req.id !== "")
      .reverse(); // Newest first
  } catch (error) {
    console.error("[ERROR] Failed to fetch all borrow requests from Google Sheets:", error);
    return [];
  }
}

/**
 * Updates the status, adminNote, returnDate and updatedAt of a borrow request in 'borrow_requests' sheet.
 */
export async function updateSheetBorrowRequestStatus(
  id: string,
  status: string,
  adminNote?: string,
  returnDate?: string
): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheets || !sheetId) {
    console.error("[ERROR] Google Sheets client is not configured. Cannot update borrow request.");
    return false;
  }

  try {
    // 1. Fetch only the ID column to find the correct row index quickly
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "borrow_requests!A2:A1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn("[WARNING] No rows found in 'borrow_requests' sheet. Cannot update.");
      return false;
    }

    const normalizedId = id.trim();
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0] || "").trim() === normalizedId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.error(`[ERROR] Borrow request with ID ${id} not found in Google Sheets.`);
      return false;
    }

    const rowNum = rowIndex + 2;
    const now = getShortTimestamp();

    // Update Status (Col L)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `borrow_requests!L${rowNum}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    // Update AdminNote (Col M) if provided
    if (adminNote !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `borrow_requests!M${rowNum}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[adminNote]],
        },
      });
    }

    // Update ReturnDate (Col J) if provided
    if (returnDate !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `borrow_requests!J${rowNum}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[returnDate]],
        },
      });
    }

    // Update UpdatedAt (Col O)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `borrow_requests!O${rowNum}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[now]],
      },
    });

    console.log(`[SUCCESS] Successfully updated borrow request ${id} to status ${status} in Google Sheets.`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to update borrow request ${id} status in Google Sheets:`, error);
    return false;
  }
}

// ----------------------------------------------------------------------
// 6. Sponsors Database Logic (Sheet: 'sponsors')
// ----------------------------------------------------------------------

export interface Sponsor {
  id: string;
  url: string;
  status: string; // active | deleted
  createdAt: string;
}

/**
 * Fetches all active sponsors from 'sponsors' tab.
 */
export async function getSponsors(): Promise<Sponsor[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return [];

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "sponsors!A2:D1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const sponsors: Sponsor[] = rows.map((row) => ({
      id: String(row[0] || "").trim(),
      url: String(row[1] || "").trim(),
      status: String(row[2] || "active").trim().toLowerCase(),
      createdAt: String(row[3] || "").trim(),
    }));

    return sponsors.filter((s) => s.status === "active" && s.id && s.url);
  } catch (error) {
    console.error("[ERROR] Failed to fetch sponsors:", error);
    return [];
  }
}

/**
 * Adds a new sponsor to the 'sponsors' tab.
 */
export async function addSponsor(url: string): Promise<Sponsor | null> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return null;

  try {
    const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const createdAt = new Date().toISOString();
    const newRow = [id, url, "active", createdAt];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "sponsors!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    console.log(`[SUCCESS] Added sponsor ${id}`);
    return { id, url, status: "active", createdAt };
  } catch (error) {
    console.error("[ERROR] Failed to add sponsor:", error);
    return null;
  }
}

/**
 * Marks a sponsor as deleted in the 'sponsors' tab.
 */
export async function deleteSponsor(id: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "sponsors!A2:A1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return false;

    // Find the row index (0-indexed in array + 2 for actual row number in sheet)
    const rowIndex = rows.findIndex((row) => String(row[0] || "").trim() === id);

    if (rowIndex === -1) {
      console.warn(`[WARNING] Sponsor ${id} not found for deletion.`);
      return false;
    }

    const actualRowNum = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `sponsors!C${actualRowNum}`, // Status column
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["deleted"]],
      },
    });

    console.log(`[SUCCESS] Deleted sponsor ${id}`);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to delete sponsor:", error);
    return false;
  }
}

// ==========================================
// NEWS SYSTEM (CMS)
// ==========================================
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  igLink: string;
  createdAt: string;
}

export async function getNewsItems(): Promise<NewsItem[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return [];

  try {
    const headers = ["ID", "Title", "Date", "Summary", "Content", "Category", "Author", "ImageUrl", "IgLink", "CreatedAt", "Status"];
    await ensureSheetExists(sheets, sheetId, "news", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "news!A2:K1000",
    });

    const rows = response.data.values || [];
    return rows
      .filter((row) => row[10] !== "deleted")
      .map((row) => ({
        id: String(row[0] || ""),
        title: String(row[1] || ""),
        date: String(row[2] || ""),
        summary: String(row[3] || ""),
        content: String(row[4] || ""),
        category: String(row[5] || ""),
        author: String(row[6] || ""),
        imageUrl: String(row[7] || ""),
        igLink: String(row[8] || ""),
        createdAt: String(row[9] || ""),
      })).filter(i => i.id);
  } catch (error) {
    console.error("[ERROR] Failed to fetch news:", error);
    return [];
  }
}

export async function addNewsItem(item: Omit<NewsItem, "id" | "createdAt">): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const createdAt = new Date().toISOString();
    const headers = ["ID", "Title", "Date", "Summary", "Content", "Category", "Author", "ImageUrl", "IgLink", "CreatedAt", "Status"];
    await ensureSheetExists(sheets, sheetId, "news", headers);

    const newRow = [id, item.title, item.date, item.summary, item.content, item.category, item.author, item.imageUrl, item.igLink, createdAt, "active"];
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "news!A:K",
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to add news:", error);
    return false;
  }
}

export async function updateNewsItem(id: string, data: Partial<NewsItem>): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "news!A2:A1000" });
    const rows = response.data.values;
    if (!rows) return false;

    const rowIndex = rows.findIndex((row) => String(row[0] || "").trim() === id.trim());
    if (rowIndex === -1) return false;

    const rowNum = rowIndex + 2;
    
    // Fetch current row to preserve un-updated fields
    const rowResp = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `news!A${rowNum}:I${rowNum}` });
    const existing = rowResp.data.values?.[0] || Array(9).fill("");
    
    const newTitle = data.title !== undefined ? data.title : existing[1];
    const newDate = data.date !== undefined ? data.date : existing[2];
    const newSummary = data.summary !== undefined ? data.summary : existing[3];
    const newContent = data.content !== undefined ? data.content : existing[4];
    const newCategory = data.category !== undefined ? data.category : existing[5];
    const newAuthor = data.author !== undefined ? data.author : existing[6];
    const newImageUrl = data.imageUrl !== undefined ? data.imageUrl : existing[7];
    const newIgLink = data.igLink !== undefined ? data.igLink : existing[8];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `news!B${rowNum}:I${rowNum}`,
      valueInputOption: "RAW",
      requestBody: { values: [[newTitle, newDate, newSummary, newContent, newCategory, newAuthor, newImageUrl, newIgLink]] }
    });
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update news:", error);
    return false;
  }
}

export async function deleteNewsItem(id: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "news!A2:A1000" });
    const rows = response.data.values;
    if (!rows) return false;

    const rowIndex = rows.findIndex((row) => String(row[0] || "").trim() === id.trim());
    if (rowIndex === -1) return false;

    const rowNum = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `news!K${rowNum}`, // Status column
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["deleted"]] }
    });
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to delete news:", error);
    return false;
  }
}

// ==========================================
// ABOUT PAGE SYSTEM
// ==========================================
export interface AboutInfo {
  history: string;
  vision: string;
  contact: string;
  showHistory: boolean;
  showVision: boolean;
  presidentName?: string;
  presidentImage?: string;
  presidentMessage?: string;
  presidentPrefix?: string;
}

export async function getAboutInfo(): Promise<AboutInfo> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const defaultInfo = { history: "", vision: "", contact: "", showHistory: true, showVision: true };
  if (!sheets || !sheetId) return defaultInfo;

  try {
    const headers = ["Section", "Content"];
    await ensureSheetExists(sheets, sheetId, "about_info", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "about_info!A2:B15",
    });

    const rows = response.data.values || [];
    const info: AboutInfo = { ...defaultInfo };
    rows.forEach(row => {
      const section = String(row[0] || "").trim();
      const content = String(row[1] || "").trim();
      if (section === "history") info.history = content;
      if (section === "vision") info.vision = content;
      if (section === "contact") info.contact = content;
      if (section === "showHistory") info.showHistory = content !== "false";
      if (section === "showVision") info.showVision = content !== "false";
      if (section === "presidentName") info.presidentName = content;
      if (section === "presidentImage") info.presidentImage = content;
      if (section === "presidentMessage") info.presidentMessage = content;
      if (section === "presidentPrefix") info.presidentPrefix = content;
    });

    return info;
  } catch (error) {
    console.error("[ERROR] Failed to fetch about info:", error);
    return defaultInfo;
  }
}

export async function updateAboutInfo(info: Partial<AboutInfo>): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const headers = ["Section", "Content"];
    await ensureSheetExists(sheets, sheetId, "about_info", headers);

    // Fetch existing
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "about_info!A2:B15",
    });
    const rows = response.data.values || [];
    
    const existing: Record<string, string> = { history: "", vision: "", contact: "", showHistory: "true", showVision: "true", presidentName: "", presidentImage: "", presidentMessage: "", presidentPrefix: "" };
    rows.forEach(row => {
      existing[String(row[0] || "").trim()] = String(row[1] || "");
    });

    const updated = {
      history: info.history !== undefined ? info.history : existing.history,
      vision: info.vision !== undefined ? info.vision : existing.vision,
      contact: info.contact !== undefined ? info.contact : existing.contact,
      showHistory: info.showHistory !== undefined ? String(info.showHistory) : existing.showHistory,
      showVision: info.showVision !== undefined ? String(info.showVision) : existing.showVision,
      presidentName: info.presidentName !== undefined ? info.presidentName : existing.presidentName,
      presidentImage: info.presidentImage !== undefined ? info.presidentImage : existing.presidentImage,
      presidentMessage: info.presidentMessage !== undefined ? info.presidentMessage : existing.presidentMessage,
      presidentPrefix: info.presidentPrefix !== undefined ? info.presidentPrefix : existing.presidentPrefix,
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "about_info!A2:B10",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["history", updated.history],
          ["vision", updated.vision],
          ["contact", updated.contact],
          ["showHistory", updated.showHistory],
          ["showVision", updated.showVision],
          ["presidentName", updated.presidentName],
          ["presidentImage", updated.presidentImage],
          ["presidentMessage", updated.presidentMessage],
          ["presidentPrefix", updated.presidentPrefix],
        ]
      }
    });

    return true;
  } catch (error) {
    console.error("[ERROR] Failed to update about info:", error);
    return false;
  }
}

// ==========================================
// ADVISORS SYSTEM
// ==========================================
export interface Advisor {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  prefix?: string;
}

export async function getAdvisors(): Promise<Advisor[]> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return [];

  try {
    const headers = ["ID", "Name", "Role", "ImageUrl", "Status", "Prefix"];
    await ensureSheetExists(sheets, sheetId, "advisors", headers);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "advisors!A2:F100",
    });

    const rows = response.data.values || [];
    return rows
      .filter(row => row[4] !== "deleted")
      .map(row => ({
        id: String(row[0] || ""),
        name: String(row[1] || ""),
        role: String(row[2] || ""),
        imageUrl: String(row[3] || ""),
        prefix: String(row[5] || "")
      })).filter(i => i.id);
  } catch (error) {
    console.error("[ERROR] Failed to fetch advisors:", error);
    return [];
  }
}

export async function addAdvisor(item: Omit<Advisor, "id">): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const headers = ["ID", "Name", "Role", "ImageUrl", "Status", "Prefix"];
    await ensureSheetExists(sheets, sheetId, "advisors", headers);

    const newRow = [id, item.name, item.role, item.imageUrl, "active", item.prefix || ""];
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "advisors!A:F",
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to add advisor:", error);
    return false;
  }
}

export async function deleteAdvisor(id: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheets || !sheetId) return false;

  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "advisors!A2:A100" });
    const rows = response.data.values;
    if (!rows) return false;

    const rowIndex = rows.findIndex((row) => String(row[0] || "").trim() === id.trim());
    if (rowIndex === -1) return false;

    const rowNum = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `advisors!E${rowNum}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["deleted"]] }
    });
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to delete advisor:", error);
    return false;
  }
}
