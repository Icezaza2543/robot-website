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

async function addMockParticipants() {
  try {
    // 1. Get the latest event ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "events!A2:H",
    });
    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log("No events found to add participants to.");
      return;
    }
    // Get the last event
    const lastEvent = rows[rows.length - 1];
    const eventId = lastEvent[0];

    // 2. Generate 20 mock participants (out of 30 max)
    const mockParticipants = [];
    const names = [
      "somchai@nu.ac.th", "somsri@nu.ac.th", "mana@nu.ac.th", "manee@nu.ac.th",
      "piti@nu.ac.th", "chujai@nu.ac.th", "veerachai@nu.ac.th", "surat@nu.ac.th",
      "wittaya@nu.ac.th", "narong@nu.ac.th", "kanya@nu.ac.th", "siriporn@nu.ac.th",
      "supachai@nu.ac.th", "taweesak@nu.ac.th", "prasert@nu.ac.th", "mongkol@nu.ac.th",
      "chalerm@nu.ac.th", "anusorn@nu.ac.th", "boonsri@nu.ac.th", "jariya@nu.ac.th",
      "nattapong@nu.ac.th", "panida@nu.ac.th", "ratana@nu.ac.th", "sakchai@nu.ac.th"
    ];

    for (let i = 0; i < 24; i++) {
      mockParticipants.push([
        eventId,
        names[i],
        new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() // Random time within last 3 days
      ]);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "event_participants!A2:C",
      valueInputOption: "RAW",
      requestBody: {
        values: mockParticipants,
      },
    });

    console.log(`Added ${mockParticipants.length} mock participants to event ID: ${eventId}`);
  } catch (err) {
    console.error("Error adding mock participants:", err.message);
  }
}

addMockParticipants();
