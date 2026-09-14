import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Filtered and paginated views carry a canonical back to the clean URL;
        // keeping them out of the crawl budget entirely is cheaper still.
        disallow: ['/api/', '/go/', '/search?', '/*?sort=', '/*?filter='],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
