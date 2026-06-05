const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  if (line.trim().startsWith('#')) return;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

async function createSheets() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY;
  const sheetId = env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.error("Missing credentials in .env.local:", { email: !!email, privateKey: !!privateKey, sheetId: !!sheetId });
    return;
  }

  let formattedKey = privateKey;
  // If it contains literal \n, replace it
  if (formattedKey.includes('\\n')) {
    formattedKey = formattedKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const existingTitles = spreadsheet.data.sheets.map(s => s.properties.title);
    
    const requests = [];

    if (!existingTitles.includes('events')) {
      requests.push({
        addSheet: {
          properties: {
            title: 'events',
            gridProperties: { rowCount: 1000, columnCount: 10 }
          }
        }
      });
      console.log("Will create 'events' sheet...");
    }

    if (!existingTitles.includes('event_participants')) {
      requests.push({
        addSheet: {
          properties: {
            title: 'event_participants',
            gridProperties: { rowCount: 5000, columnCount: 5 }
          }
        }
      });
      console.log("Will create 'event_participants' sheet...");
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests }
      });
      console.log("Sheets created successfully!");
      
      // Optionally add headers
      if (!existingTitles.includes('events')) {
         await sheets.spreadsheets.values.update({
           spreadsheetId: sheetId,
           range: "events!A1:H1",
           valueInputOption: "RAW",
           requestBody: { values: [["id", "title", "date", "location", "description", "imageUrl", "maxParticipants", "status"]] }
         });
      }
      if (!existingTitles.includes('event_participants')) {
         await sheets.spreadsheets.values.update({
           spreadsheetId: sheetId,
           range: "event_participants!A1:C1",
           valueInputOption: "RAW",
           requestBody: { values: [["eventId", "userEmail", "joinedAt"]] }
         });
      }
      console.log("Headers added.");
    } else {
      console.log("Sheets already exist.");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

createSheets();
