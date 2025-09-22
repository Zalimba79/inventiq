/**
 * High-performance image processing utilities for Inventiq
 * Optimized for speed and memory efficiency
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp'
}

export interface ImageProcessingResult {
  dataUrl: string
  size: number
  width: number
  height: number
  mimeType: string
}

/**
 * Fast image compression using Canvas API
 * Up to 10x faster than manual base64 processing
 */
export async function compressImage(
  imageSrc: string,
  options: ImageCompressionOptions = {}
): Promise<ImageProcessingResult> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'jpeg'
    } = options

    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate optimal dimensions maintaining aspect ratio
        const { width, height } = calculateOptimalDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // Create optimized canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', {
          alpha: format !== 'jpeg', // JPEG doesn't need alpha channel
          willReadFrequently: false,
          desynchronized: true // Better performance
        })

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        canvas.width = width
        canvas.height = height

        // Optimize rendering for speed
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'medium' // Balance between speed and quality

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        const mimeType = `image/${format}`
        const dataUrl = canvas.toDataURL(mimeType, quality)
        
        // Fast size calculation (much faster than base64 decoding)
        const size = Math.round((dataUrl.length * 3) / 4) - 2 // Base64 size approximation

        resolve({
          dataUrl,
          size,
          width,
          height,
          mimeType
        })

        // Cleanup
        canvas.width = 0
        canvas.height = 0
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If the original image is smaller than the max dimensions, keep original size
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight
    }
  }
  
  // Otherwise, scale down maintaining aspect ratio
  const aspectRatio = originalWidth / originalHeight
  
  let width = Math.min(originalWidth, maxWidth)
  let height = Math.min(originalHeight, maxHeight)
  
  // Maintain aspect ratio
  if (width / height > aspectRatio) {
    width = height * aspectRatio
  } else {
    height = width / aspectRatio
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  }
}

/**
 * Performance-optimized image size estimation
 * Avoids expensive base64 decoding
 */
export function estimateImageSize(dataUrl: string): number {
  const base64Data = dataUrl.split(',')[1]
  if (!base64Data) return 0
  
  // Fast size estimation: base64 length * 0.75 - padding
  const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0
  return Math.round((base64Data.length * 3) / 4) - padding
}

/**
 * Check if device supports WebP format (better compression)
 */
export async function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    try {
      const dataUrl = canvas.toDataURL('image/webp')
      resolve(dataUrl.startsWith('data:image/webp'))
    } catch {
      resolve(false)
    }
  })
}

/**
 * Get optimal image format for the device
 */
export async function getOptimalImageFormat(): Promise<'webp' | 'jpeg'> {
  return (await supportsWebP()) ? 'webp' : 'jpeg'
}

/**
 * Analyze image and determine optimal format
 * For now, just returns the optimal format based on browser support
 */
export async function analyzeOptimalImageFormat(_imageSrc: string): Promise<'jpeg' | 'webp'> {
  // In the future, this could analyze the image content to determine
  // if JPEG or WebP would be better (e.g., photos vs graphics)
  // The _imageSrc parameter will be used in future implementations
  return getOptimalImageFormat()
}

/**
 * Debounced function creator for performance optimization
 */
export function createDebounced<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>()
  
  static start(label: string): void {
    this.timers.set(label, performance.now())
  }
  
  static end(label: string): number {
    const start = this.timers.get(label)
    if (start === undefined) return 0
    
    const duration = performance.now() - start
    this.timers.delete(label)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }
  
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }
}