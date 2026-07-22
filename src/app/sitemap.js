export default function sitemap() {
  const baseUrl = 'https://kollecta-web-teal.vercel.app';

  return [
    { url: baseUrl,                     lastModified: new Date(), changeFrequency: 'daily',  priority: 1 },
    { url: `${baseUrl}/dons`,           lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/encheres`,       lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/connexion`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/inscription`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
