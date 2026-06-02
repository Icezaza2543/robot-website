import { google } from "googleapis";
import { Readable } from "stream";

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  if (!email || !privateKey) {
    console.warn("[WARNING] Google Drive API credentials are not fully configured.");
    return null;
  }

  try {
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email,
      key: formattedKey,
      scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
    });

    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("[ERROR] Failed to initialize Google Drive Auth Client:", error);
    return null;
  }
}

export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!drive || !folderId) {
    console.error("[ERROR] Drive client or folder ID missing.");
    return null;
  }

  try {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    const fileId = response.data.id;
    if (!fileId) return null;

    // Make the file publicly accessible so it can be viewed on the web
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Return the webContentLink which can be used directly as an image source, 
    // or we can construct a direct download link
    // Google Drive direct link format: https://drive.google.com/uc?export=view&id=FILE_ID
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error("[ERROR] Failed to upload file to Google Drive:", error);
    return null;
  }
}
