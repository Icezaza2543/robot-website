import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // หน้าสำคัญสุด
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // อัปเดตบ่อย มีการเปลี่ยนแปลง Stock
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // หมายเหตุ: ในอนาคตถ้าหน้า Equipment มีการดึงข้อมูลรายชิ้น (Dynamic Route)
    // สามารถดึงข้อมูลจาก DB มา map เพื่อ generate URL ของแต่ละอุปกรณ์ใส่ sitemap เพิ่มได้ที่นี่ครับ
  ]
}
