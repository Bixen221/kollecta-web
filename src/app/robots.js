export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profil', '/profil/', '/publier'],
    },
    sitemap: 'https://kollecta-web-teal.vercel.app/sitemap.xml',
  };
}
