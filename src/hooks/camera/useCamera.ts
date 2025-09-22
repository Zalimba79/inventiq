"use client"

import { useCallback, useRef, useState } from 'react'

export interface CaptureOptions {
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
  width?: number
  height?: number
}

export interface UseCameraReturn {
  isCapturing: boolean
  lastCapture: string | null
  capturePhoto: (stream: MediaStream, options?: CaptureOptions) => Promise<string>
  captureFromVideo: (videoElement: HTMLVideoElement, options?: CaptureOptions) => string
  captureWithImageCapture: (stream: MediaStream, options?: CaptureOptions) => Promise<string>
}

export function useCamera(): UseCameraReturn {
  const [isCapturing, setIsCapturing] = useState(false)
  const [lastCapture, setLastCapture] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const captureFromVideo = useCallback(
    (videoElement: HTMLVideoElement, options: CaptureOptions = {}): string => {
      const { 
        quality = 0.9, 
        format = 'jpeg',
        width = videoElement.videoWidth,
        height = videoElement.videoHeight
      } = options

      canvasRef.current ??= document.createElement('canvas')
      
      const canvas = canvasRef.current
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')
      
      ctx.drawImage(videoElement, 0, 0, width, height)
      
      const dataUrl = canvas.toDataURL(`image/${format}`, quality)
      setLastCapture(dataUrl)
      
      return dataUrl
    },
    []
  )

  const captureWithImageCapture = useCallback(
    async (stream: MediaStream, options: CaptureOptions = {}): Promise<string> => {
      const { } = options

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) throw new Error('No video track available')

      if (typeof ImageCapture === 'undefined') {
        throw new Error('ImageCapture API not supported')
      }

      const imageCapture = new ImageCapture(videoTrack)
      
      try {
        const blob = await imageCapture.takePhoto({
          imageHeight: options.height,
          imageWidth: options.width
        })
        
        // Convert blob to data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            setLastCapture(result)
            resolve(result)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.error('ImageCapture failed:', err)
        throw err
      }
    },
    []
  )

  const capturePhoto = useCallback(
    async (stream: MediaStream, options: CaptureOptions = {}): Promise<string> => {
      setIsCapturing(true)
      
      try {
        // Try ImageCapture API first (better quality)
        if ('ImageCapture' in window) {
          try {
            const result = await captureWithImageCapture(stream, options)
            return result
          } catch (err) {
            console.warn('ImageCapture failed, falling back to canvas:', err)
          }
        }
        
        // Fallback to canvas capture
        const video = document.createElement('video')
        video.srcObject = stream
        void video.play()
        
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const result = captureFromVideo(video, options)
            video.pause()
            video.srcObject = null
            resolve(result)
          }
        })
      } finally {
        setIsCapturing(false)
      }
    },
    [captureFromVideo, captureWithImageCapture]
  )

  return {
    isCapturing,
    lastCapture,
    capturePhoto,
    captureFromVideo,
    captureWithImageCapture
  }
}