import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Avatar Proxy Route Handler with Next.js Caching
 * 
 * This route proxies avatar images from the API server and uses Next.js caching
 * to improve performance and reduce server load.
 * 
 * Based on: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    let imagePath = path.join('/');
    
    // Remove query parameters if present (for retry logic)
    // Query params like ?retry=1&t=... should not affect the path
    if (imagePath.includes('?')) {
      imagePath = imagePath.split('?')[0];
    }
    
    // Validate path to prevent directory traversal and ensure it's a statics path
    if (!imagePath || imagePath.includes('..') || !imagePath.startsWith('statics/')) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Construct the full API URL
    // Keep full path including 'statics/'
    const apiPath = imagePath;
    const apiUrl = `${API_URL}/${apiPath}`;

    // Fetch image with Next.js caching
    // Using Next.js fetch caching with revalidation
    // Reference: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
    // Note: We don't cache 429 errors to allow retry after rate limit resets
     
    const response = await fetch(apiUrl, {
      next: {
        revalidate: 3600, // Revalidate after 1 hour (3600 seconds)
        tags: ['avatar', `avatar-${imagePath}`], // Tag for on-demand revalidation with revalidateTag
      },
      headers: {
        'Accept': 'image/webp,image/avif,image/png,image/jpeg,image/gif,*/*',
      },
      // Don't cache 429 errors - allow retry after rate limit window
      cache: 'default',
    });

    if (!response.ok) {
      // Handle rate limiting (429) - return placeholder to prevent retry loops
      // When backend rate limits, return placeholder image instead of 429
      // This prevents frontend from retrying and making the problem worse
      if (response.status === 429) {
        const placeholderBytes = new Uint8Array([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
          0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
        ]);
        
        return new NextResponse(placeholderBytes, {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'image/gif',
            'X-Avatar-Status': 'rate-limited', // Custom header to indicate rate limit
          },
        });
      }
      
      // Handle 404 (file doesn't exist) - return 200 with 1x1 transparent GIF to avoid console errors
      // Next.js 16 compatible: Use ArrayBuffer for Edge Runtime compatibility
      if (response.status === 404) {
        // Return 1x1 transparent GIF as placeholder (base64: R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)
        // For Next.js 16 Edge Runtime: Use hardcoded bytes array instead of Buffer/atob
        const placeholderBytes = new Uint8Array([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
          0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
          0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
        ]);
        
        return new NextResponse(placeholderBytes, {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'image/gif',
            'X-Avatar-Status': 'not-found', // Custom header to indicate placeholder
          },
        });
      }
      
      // Other errors
      return new NextResponse('Image not found', { status: response.status });
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/webp';

    // Return cached image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Avatar proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Route segment config for caching
// This route will be cached and revalidated every hour
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

