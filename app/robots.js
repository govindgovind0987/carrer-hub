import { siteConfig } from '@/config';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
