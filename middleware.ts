import createMiddleware from 'next-intl/middleware';
import { i18n } from './i18n.config';
import { NextRequest, NextResponse } from 'next/server';

// Create middleware for internationalization
const intlMiddleware = createMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

// Constants for caching
const WEEK_IN_SECONDS = 1; // 7 days in seconds
const WEBP_CACHE_HEADERS = {
  'Cache-Control': `public, max-age=${WEEK_IN_SECONDS}, immutable, stale-while-revalidate=${WEEK_IN_SECONDS}`,
  'CDN-Cache-Control': `public, max-age=${WEEK_IN_SECONDS}`,
  'Vercel-CDN-Cache-Control': `public, max-age=${WEEK_IN_SECONDS}`,
  'X-Content-Type-Options': 'nosniff',
};

// Main middleware that handles internationalization and WebP image caching
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle only WebP images
  if (pathname.endsWith('.webp')) {
    // Get response with image
    const response = NextResponse.next();

    // Add caching headers
    Object.entries(WEBP_CACHE_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // For all other requests use internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Matcher for internationalization
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Matcher only for WebP images - using Next.js path matching format
    '/:path*.webp',
  ],
};
