export async function uploadFileToImgbb(fileBuffer: Buffer, fileName: string): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey) {
    console.error("[ERROR] IMGBB_API_KEY is not defined in environment variables.");
    return null;
  }

  try {
    // ImgBB requires base64 encoded string without the data URI prefix
    const base64Image = fileBuffer.toString("base64");

    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("image", base64Image);
    formData.append("name", fileName.split('.')[0]); // optional name

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // data.data.url is the direct image link
      return data.data.url;
    } else {
      console.error("[ERROR] ImgBB Upload Failed:", data.error?.message);
      return null;
    }
  } catch (error: any) {
    console.error("[ERROR] Exception during ImgBB upload:", error);
    throw new Error(error.message || "Failed to upload to ImgBB");
  }
}
