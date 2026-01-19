import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/test'],
    },
    sitemap: 'https://www.butchersnearme.co.uk/sitemap.xml',
  }
}