/**
 * Utility to handle image URLs for mixed content scenarios
 * Converts HTTP MinIO URLs to use the proxy API when on HTTPS
 */

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined'

/**
 * Check if current page is served over HTTPS
 */
const isHTTPS = isBrowser && window.location.protocol === 'https:'

/**
 * Check if a URL is a MinIO URL that needs proxying
 */
function isMinIOUrl(url: string): boolean {
  return url.includes('10.2.200.102:9000') || url.includes('inventiq-assets')
}

/**
 * Convert HTTP MinIO URLs to use proxy when on HTTPS
 * @param url - The original image URL
 * @returns The proxied URL if needed, or original URL
 */
export function getSecureImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  
  // If not in browser or not HTTPS, return original
  if (!isBrowser || !isHTTPS) {
    return url
  }
  
  // If URL is already HTTPS or not a MinIO URL, return as-is
  if (url.startsWith('https://') || !isMinIOUrl(url)) {
    return url
  }
  
  // Use proxy API for HTTP MinIO URLs on HTTPS pages
  return `/api/proxy/image?url=${encodeURIComponent(url)}`
}

/**
 * Hook to get secure image URL
 * Useful in React components
 */
export function useSecureImageUrl(url: string | undefined): string | undefined {
  if (!isBrowser) return url
  return getSecureImageUrl(url)
}