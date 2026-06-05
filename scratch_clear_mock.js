const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Manually parse .env.local
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

const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = env.GOOGLE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}
const sheetId = env.GOOGLE_SHEET_ID;

if (!clientEmail || !privateKey || !sheetId) {
  console.error("Missing credentials in .env.local");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function clearMocks() {
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "events!A2:Z",
    });
    
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "event_participants!A2:Z",
    });

    console.log("Mock data cleared successfully!");
  } catch (err) {
    console.error("Error clearing mock data:", err.message);
  }
}

clearMocks();
