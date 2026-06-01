import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // ป้องกันไม่ให้ Bot เข้าไป Index หน้าที่เป็นความลับหรือหน้าที่ต้อง Login
      disallow: [
        '/admin/', 
        '/api/', 
        '/borrow/', 
        '/profile/', 
        '/cart/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
