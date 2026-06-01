import nodemailer from "nodemailer";
import { BorrowRequest } from "@/lib/googleSheets";

// Reusable Transporter setup
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // SMTP is not configured
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatch Email with automatic dev fallback logging
 */
async function dispatchEmail(subject: string, htmlContent: string) {
  const adminEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  if (!adminEmails) {
    console.warn("[WARNING] ADMIN_EMAILS environment variable is not configured. Email will be logged to console.");
  }

  const recipient = adminEmails || "admin-receiver@robot-club.nu.ac.th";
  const transporter = getTransporter();

  if (!transporter) {
    // Elegant Developer Logging Fallback
    console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│ [EMAIL] DEVELOPER MOCK EMAIL LOG                                       │
├────────────────────────────────────────────────────────────────────────┤
│ Subject:   ${subject.padEnd(60)}│
│ Recipient: ${recipient.padEnd(60)}│
├────────────────────────────────────────────────────────────────────────┤
│ SMTP variables missing from .env. Outputting email body:              │
│                                                                        │
${htmlContent.split("\n").map(line => `│ ${line.slice(0, 70).padEnd(70)} │`).join("\n")}
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
`);
    return true; // Simulate success
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"NU Robot Club Alerts" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject,
      html: htmlContent,
    });
    console.log(`[SUCCESS] Email notification sent successfully to ${recipient} [Subject: ${subject}]`);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to dispatch email notification via SMTP:", error);
    return false;
  }
}

/**
 * HTML Template Helper for Premium Branding styling
 */
function getEmailBaseTemplate(title: string, bodyHtml: string) {
  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <tr>
          <td style="background-color: #0F172A; padding: 40px 30px; text-align: center; border-bottom: 4px solid #F97316;">
            <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0;">NU Robot Club</h1>
            <p style="color: #94A3B8; font-size: 12px; font-weight: 600; margin: 5px 0 0 0; text-transform: uppercase;">Smart Notifications Layer</p>
          </td>
        </tr>
        <!-- Body Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="font-size: 22px; font-weight: 900; color: #0F172A; margin-top: 0; margin-bottom: 20px; text-align: center;">${title}</h2>
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #F1F5F9; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="font-size: 11px; font-weight: 600; color: #64748B; margin: 0;">
              ระบบประสานงานแจ้งเตือนอัจฉริยะ • ชมรมหุ่นยนต์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
            </p>
            <p style="font-size: 10px; font-weight: 500; color: #94A3B8; margin: 6px 0 0 0;">
              อีเมลฉบับนี้ส่งโดยระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้โดยตรง
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Format items list from JSON string
 */
function formatEmailItems(itemsJson: string): string {
  try {
    const items = JSON.parse(itemsJson);
    if (!Array.isArray(items) || items.length === 0) return "<p>ไม่มีรายการสิ่งของ</p>";

    let rowsHtml = "";
    items.forEach((item: any) => {
      rowsHtml += `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 12px 10px; font-family: monospace; font-size: 12px; font-weight: bold; color: #64748B;">${item.id}</td>
          <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #334155;">${item.name}</td>
          <td style="padding: 12px 10px; font-size: 12px; font-weight: 600; color: #64748B;">${item.category}</td>
          <td style="padding: 12px 10px; font-size: 13px; font-weight: 800; color: #0F172A; text-align: center;">${item.quantity}</td>
        </tr>
      `;
    });

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 15px; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
        <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
          <th align="left" style="padding: 12px 10px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">ID สินค้า</th>
          <th align="left" style="padding: 12px 10px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">ชื่ออุปกรณ์</th>
          <th align="left" style="padding: 12px 10px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">หมวดหมู่</th>
          <th align="center" style="padding: 12px 10px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; text-align: center;">จำนวน</th>
        </tr>
        ${rowsHtml}
      </table>
    `;
  } catch (e) {
    return `<p style="font-size: 13px; color: #EF4444;">ล้มเหลวในการแกะข้อมูลอุปกรณ์: ${itemsJson}</p>`;
  }
}

/**
 * 1. Event: New borrow request submitted
 */
export async function sendNewBorrowNotification(request: BorrowRequest) {
  const subject = `[คำขอยืมใหม่] รหัสอ้างอิง: ${request.id} - โดย ${request.borrowerName}`;
  const bodyHtml = `
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">เรียน ผู้ดูแลระบบคลังชมรมโรบอท,</p>
      <p>มีคำขอยืมอุปกรณ์คอมโพเนนต์หรือไมโครคอนโทรลเลอร์ตัวใหม่ยื่นเข้ามาในระบบ โปรดเข้าตรวจสอบและทำรายการตัดสินใจ:</p>
      
      <!-- Borrower Details -->
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 25px 0;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">ข้อมูลผู้ทำเรื่องขอยืม</h3>
        <table width="100%" style="font-size: 13px; font-weight: 600; color: #475569;">
          <tr>
            <td width="35%" style="color: #94A3B8; padding: 4px 0;">รหัสคำขอ:</td>
            <td style="color: #F97316; font-weight: 800;">${request.id}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">ผู้รับผิดชอบการยืม:</td>
            <td style="color: #334155;">${request.borrowerName}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">เบอร์โทรศัพท์ติดต่อ:</td>
            <td style="color: #334155; font-weight: bold;">${request.borrowerPhone}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">อีเมลล็อกอินระบบ:</td>
            <td style="color: #334155;">${request.userEmail}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">กำหนดส่งคืนสิ่งของ:</td>
            <td style="color: #0F172A; font-weight: bold;">${request.dueDate}</td>
          </tr>
        </table>
      </div>

      <!-- Items Section -->
      <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 5px; text-transform: uppercase;">รายการสิ่งของอุปกรณ์ที่ขอยืม</h3>
      ${formatEmailItems(request.items)}

      <!-- Note Section -->
      ${request.note ? `
        <div style="margin-top: 25px; font-size: 13px;">
          <h4 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; text-transform: uppercase;">จุดประสงค์ของการขอยืม:</h4>
          <blockquote style="margin: 0; padding: 12px 16px; background-color: #FFF7ED; border-left: 4px solid #F97316; border-radius: 0 12px 12px 0; color: #7C2D12; font-style: italic; font-weight: bold;">
            "${request.note}"
          </blockquote>
        </div>
      ` : ""}

      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/borrow" style="display: inline-block; background-color: #F97316; color: #FFFFFF; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
          เปิดหน้าจออนุมัติคลังระบบหลังบ้าน
        </a>
      </div>
    </div>
  `;

  return dispatchEmail(subject, getEmailBaseTemplate("คำขอยืมวัสดุอุปกรณ์ใหม่", bodyHtml));
}

/**
 * 2. Event: Member requests a return
 */
export async function sendReturnRequestNotification(request: BorrowRequest) {
  const subject = `[ยื่นส่งคืนของ] รหัสใบยืม: ${request.id} - รอตรวจรับโดย ${request.borrowerName}`;
  const bodyHtml = `
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">เรียน ผู้ดูแลระบบคลังชมรมโรบอท,</p>
      <p>สมาชิกผู้ถือครองได้ทำการส่งเรื่อง **"คำขอคืนอุปกรณ์"** เรียบร้อยแล้ว โปรดเตรียมตรวจสอบสภาพวัสดุจริงและกดยืนยันตรวจรับกลับเข้าคลังสต็อกในระบบ:</p>
      
      <!-- Borrow details -->
      <div style="background-color: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 16px; padding: 20px; margin: 25px 0; color: #0F766E;">
        <table width="100%" style="font-size: 13px; font-weight: 600;">
          <tr>
            <td width="35%" style="color: #14B8A6; padding: 4px 0;">รหัสใบคำขอ:</td>
            <td style="font-weight: 800; color: #0D9488;">${request.id}</td>
          </tr>
          <tr>
            <td style="color: #14B8A6; padding: 4px 0;">ผู้รับผิดชอบการยืม:</td>
            <td style="color: #0F172A;">${request.borrowerName} (${request.borrowerPhone})</td>
          </tr>
          <tr>
            <td style="color: #14B8A6; padding: 4px 0;">กำหนดคืนตามเงื่อนไข:</td>
            <td style="color: #0F172A;">${request.dueDate}</td>
          </tr>
        </table>
      </div>

      <!-- Items Section -->
      <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 5px; text-transform: uppercase;">รายการสิ่งของอุปกรณ์ที่จะส่งคืน</h3>
      ${formatEmailItems(request.items)}

      <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/borrow" style="display: inline-block; background-color: #0D9488; color: #FFFFFF; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);">
          เปิดระบบอนุมัติเพื่อกดยืนยันรับของคืน
        </a>
      </div>
    </div>
  `;

  return dispatchEmail(subject, getEmailBaseTemplate("สมาชิกส่งคำขอคืนอุปกรณ์", bodyHtml));
}

/**
 * 3. Event: Return confirmed by Admin
 */
export async function sendReturnConfirmedNotification(request: BorrowRequest) {
  const subject = `[เสร็จสิ้น] ยืนยันรับคืนอุปกรณ์สำเร็จ รหัสใบยืม: ${request.id}`;
  const bodyHtml = `
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">เรียน ผู้ดูแลระบบคลังชมรมโรบอท,</p>
      <p>คุณได้ทำการกดยืนยัน **"รับคืนสิ่งของวัสดุเข้าคลัง"** เรียบร้อยแล้วในระบบ ยอดสต็อกสิ่งของอุปกรณ์ได้รับการบวกเพิ่มกลับคืนใน Google Sheets ตามสัดส่วนเรียบร้อยครับ:</p>
      
      <!-- Borrow details -->
      <div style="background-color: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 16px; padding: 20px; margin: 25px 0; color: #1E40AF;">
        <table width="100%" style="font-size: 13px; font-weight: 600;">
          <tr>
            <td width="35%" style="color: #3B82F6; padding: 4px 0;">รหัสใบคำขอเดิม:</td>
            <td style="font-weight: 800; color: #1D4ED8;">${request.id}</td>
          </tr>
          <tr>
            <td style="color: #3B82F6; padding: 4px 0;">ผู้ยืมสิ่งของ:</td>
            <td style="color: #0F172A;">${request.borrowerName} (${request.borrowerPhone})</td>
          </tr>
          <tr>
            <td style="color: #3B82F6; padding: 4px 0;">วันที่รับคืนเข้าสต็อก:</td>
            <td style="color: #0F172A; font-weight: bold;">${new Date().toISOString().split('T')[0]}</td>
          </tr>
        </table>
      </div>

      <!-- Items Section -->
      <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 5px; text-transform: uppercase;">รายการสิ่งของอุปกรณ์ที่เก็บคืนสำเร็จ</h3>
      ${formatEmailItems(request.items)}
    </div>
  `;

  return dispatchEmail(subject, getEmailBaseTemplate("ดำเนินการตรวจรับคืนของสำเร็จ", bodyHtml));
}

/**
 * 4. Event: Item stock running low / out of stock
 */
export async function sendLowStockNotification(item: any, remaining: number) {
  const isOutOfStock = remaining === 0;
  const severityTag = isOutOfStock ? "[สินค้าหมดคลัง!]" : "[วัสดุใกล้หมดคลัง]";
  const subject = `${severityTag} อุปกรณ์รหัส ${item.id} (${item.name}) เหลือ ${remaining} ชิ้น`;
  
  const bodyHtml = `
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">เรียน ผู้ดูแลระบบคลังชมรมโรบอท,</p>
      <p>ระบบแจ้งเตือนพบสินค้าในระบบคลังพัสดุ Google Sheets มีจำนวนคงเหลือต่ำกว่าเกณฑ์ความปลอดภัย หรือหมดลงโดยสิ้นเชิง:</p>
      
      <!-- Warning Details -->
      <div style="background-color: ${isOutOfStock ? '#FEF2F2' : '#FFFBEB'}; border: 1px solid ${isOutOfStock ? '#FEE2E2' : '#FEF3C7'}; border-radius: 16px; padding: 22px; margin: 25px 0;">
        <table width="100%" style="font-size: 13px; font-weight: 600;">
          <tr>
            <td width="35%" style="color: #94A3B8; padding: 4px 0;">รหัสอุปกรณ์:</td>
            <td style="font-family: monospace; font-size: 13px; font-weight: bold; color: #0F172A;">${item.id}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">ชื่อพัสดุอุปกรณ์:</td>
            <td style="color: #0F172A; font-weight: 800; font-size: 14px;">${item.name}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">หมวดหมู่:</td>
            <td style="color: #475569;">${item.category}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">สถานที่จัดเก็บพัสดุ:</td>
            <td style="color: #475569;">${item.location || 'ไม่ได้ระบุ'}</td>
          </tr>
          <tr>
            <td style="color: #94A3B8; padding: 4px 0;">สถานะยอดคงคลัง:</td>
            <td style="color: ${isOutOfStock ? '#EF4444' : '#D97706'}; font-weight: 900; font-size: 15px;">
              ${isOutOfStock ? 'หมดคลังสต็อก (0 ชิ้น)' : `ใกล้หมดคลัง (คงเหลือ ${remaining} ชิ้น)`}
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748B; font-weight: bold; leading-relaxed;">
        * แนะนำให้แอดมินหรือคณะกรรมการฝ่ายพัสดุเร่งพิจารณาสั่งซื้อมอเตอร์, คอนโทรลเลอร์ หรือเซนเซอร์ดังกล่าวเพิ่มเติม หรือจำกัดการขอยืมสิ่งของนี้ทางหน้าเว็บ เพื่อลดความขัดแย้งในการทำธุรกรรมยื่นจองของสมาชิกชมรมครับ
      </p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/items" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px;">
          เปิดหน้าจอตรวจยอดสต็อกหลังบ้าน
        </a>
      </div>
    </div>
  `;

  return dispatchEmail(subject, getEmailBaseTemplate(isOutOfStock ? "อุปกรณ์หมดสต็อกในคลังพัสดุ" : "อุปกรณ์ยอดคงคลังต่ำกว่าเกณฑ์", bodyHtml));
}

/**
 * 5. Event: Overdue borrow request alert
 */
export async function sendOverdueNotification(request: BorrowRequest) {
  const subject = `[เกินกำหนดส่งคืน!] รหัสใบยืม: ${request.id} - ค้างคืนโดย ${request.borrowerName}`;
  const bodyHtml = `
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">เรียน ผู้ดูแลระบบคลังชมรมโรบอท,</p>
      <p style="color: #EF4444; font-weight: bold;">[ALERT] ระบบแจ้งเตือนอัตโนมัติพบการยืมสิ่งของวัสดุ **"เกินกำหนดส่งคืนส่งกลับ"** (Overdue)!</p>
      <p>ใบคำขอขอยืมนี้พ้นเกณฑ์กำหนดส่งคืนที่สมาชิกกรอกจองไว้แล้ว และยังไม่มีการกดยืนยันขอคืนของเข้ามา โปรดดำเนินการเร่งรัดและประสานงานติดต่อกลับนิสิต:</p>
      
      <!-- Overdue details -->
      <div style="background-color: #FFF5F5; border: 1px solid #FED7D7; border-radius: 16px; padding: 20px; margin: 25px 0; color: #9B2C2C;">
        <table width="100%" style="font-size: 13px; font-weight: 600;">
          <tr>
            <td width="35%" style="color: #E53E3E; padding: 4px 0;">รหัสใบยืมที่เกินกำหนด:</td>
            <td style="font-weight: 800; color: #C53030;">${request.id}</td>
          </tr>
          <tr>
            <td style="color: #E53E3E; padding: 4px 0;">ผู้ยืมผู้ถือครอง:</td>
            <td style="color: #0F172A;">${request.borrowerName}</td>
          </tr>
          <tr>
            <td style="color: #E53E3E; padding: 4px 0;">เบอร์โทรศัพท์นิสิต:</td>
            <td style="color: #0F172A; font-weight: bold;">${request.borrowerPhone}</td>
          </tr>
          <tr>
            <td style="color: #E53E3E; padding: 4px 0;">อีเมลสมาชิก:</td>
            <td style="color: #0F172A;">${request.userEmail}</td>
          </tr>
          <tr>
            <td style="color: #E53E3E; padding: 4px 0;">วันที่กำหนดคืนเดิม:</td>
            <td style="color: #C53030; font-weight: 900;">${request.dueDate}</td>
          </tr>
        </table>
      </div>

      <!-- Items Section -->
      <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 5px; text-transform: uppercase;">รายการสิ่งของอุปกรณ์ค้างส่งคืน</h3>
      ${formatEmailItems(request.items)}

      <p style="font-size: 12px; color: #718096; font-weight: 500; line-height: 1.5; margin-top: 25px;">
        * ข้อมูลสถานะใบคำขอนี้บน Google Sheets ได้รับการอัปเดตเปลี่ยนสถานะเป็น "overdue" เรียบร้อยแล้ว เพื่อแจ้งเตือนให้สมาชิกทราบเมื่อล็อกอินตรวจสอบประวัติตัวเอง
      </p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="mailto:${request.userEmail}?subject=ติดตามคืนอุปกรณ์ค้างส่งชมรม%20NU%20Robot%20(ใบยืม%20${request.id})" style="display: inline-block; background-color: #E53E3E; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.2);">
          ส่งอีเมลแจ้งเตือนนิสิตผู้ยืมโดยตรง
        </a>
      </div>
    </div>
  `;

  return dispatchEmail(subject, getEmailBaseTemplate("พบวัสดุค้างส่งคืนเกินกำหนดส่ง", bodyHtml));
}
