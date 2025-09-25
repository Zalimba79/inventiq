"use client"

import { useState } from 'react'

interface UploadResult {
  success: boolean
  url?: string
  thumbnailUrl?: string
  filename?: string
  size?: number
  error?: string
}

interface UseMinioUploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

/**
 * Hook for uploading images to MinIO storage
 */
export function useMinioUpload(options?: UseMinioUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const uploadBase64 = async (
    productId: string,
    base64Data: string,
    filename?: string
  ): Promise<UploadResult> => {
    setIsUploading(true)
    setProgress(0)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          base64Data,
          filename: filename || `capture-${Date.now()}.jpg`
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      
      setProgress(100)
      options?.onSuccess?.(data)
      
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      options?.onError?.(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsUploading(false)
    }
  }
  
  const uploadFile = async (
    productId: string,
    file: File
  ): Promise<UploadResult> => {
    setIsUploading(true)
    setProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)
      
      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setProgress(percentComplete)
            options?.onProgress?.(percentComplete)
          }
        })
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            options?.onSuccess?.(data)
            resolve(data)
          } else {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || 'Upload failed'))
          }
        })
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error'))
        })
        
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      options?.onError?.(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsUploading(false)
    }
  }
  
  const uploadMultiple = async (
    productId: string,
    files: File[]
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await uploadFile(productId, file)
      results.push(result)
      
      // Update overall progress
      const overallProgress = ((i + 1) / files.length) * 100
      setProgress(overallProgress)
      options?.onProgress?.(overallProgress)
    }
    
    return results
  }
  
  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }
      
      console.log('Image deleted from MinIO:', url)
      return true
    } catch (error) {
      console.error('Failed to delete image from MinIO:', error)
      return false
    }
  }
  
  return {
    uploadBase64,
    uploadFile,
    uploadMultiple,
    deleteImage,
    isUploading,
    progress
  }
}