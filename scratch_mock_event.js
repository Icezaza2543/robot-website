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

async function addMockEvent() {
  try {
    const newEvent = [
      Date.now().toString(), // id
      "อบรมพื้นฐาน IoT และไมโครคอนโทรลเลอร์เบื้องต้น (IoT & MCU Basics)", // title
      "20 มิ.ย. 67 (09:00 - 16:00)", // date
      "ห้องปฏิบัติการคอมพิวเตอร์ EN615", // location
      "มาเรียนรู้พื้นฐานการใช้งานบอร์ด ESP32, การเขียนโปรแกรมภาษา C++, และการเชื่อมต่อเซนเซอร์ต่างๆ เข้ากับระบบ IoT เพื่อให้สามารถนำไปประยุกต์ใช้สร้างโครงงานนวัตกรรมของตัวเองได้!\n\n- สิ่งที่ต้องเตรียมมา: Laptop ส่วนตัว\n- เหมาะสำหรับ: นิสิตที่ยังไม่มีพื้นฐาน หรืออยากทบทวนความรู้\n- ฟรีอุปกรณ์ทั้งหมดตลอดการอบรม", // description
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", // imageUrl
      "30", // maxParticipants
      "active" // status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "events!A2:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [newEvent],
      },
    });

    console.log("Mock event added successfully!");
  } catch (err) {
    console.error("Error adding mock event:", err.message);
  }
}

addMockEvent();
