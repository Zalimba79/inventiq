"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Camera, Smartphone, Monitor, Mic, Video, Download, Zap, Sun, Image, Layers, QrCode, Smile, ZoomIn, Contrast, Activity } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface CameraTestControlsProps {
  className?: string
  currentStream?: MediaStream | null
  onStreamUpdate?: (stream: MediaStream) => void
}

/**
 * Camera Test Controls
 * Test all Web API camera features
 */
export function CameraTestControls({ 
  className,
  currentStream,
  onStreamUpdate
}: CameraTestControlsProps): JSX.Element {
  // Basic Camera Controls
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCamera, setCurrentCamera] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 })
  const [frameRate, setFrameRate] = useState(30)
  
  // Audio
  const [audioEnabled, setAudioEnabled] = useState(false)
  
  // Recording
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  // Digital Zoom
  const [digitalZoom, setDigitalZoom] = useState(1)
  
  // Filters
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [blur, setBlur] = useState(0)
  
  // Multi-shot
  const [burstMode, setBurstMode] = useState(false)
  const [burstCount, setBurstCount] = useState(5)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    enumerateCameras()
  }, [])

  // 1. Enumerate all cameras
  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      setCameras(videoDevices)
      console.log('Found cameras:', videoDevices)
    } catch (err) {
      console.error('Failed to enumerate devices:', err)
    }
  }

  // 2. Get user media with specific constraints
  const startCamera = async (constraints: MediaStreamConstraints) => {
    try {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      onStreamUpdate?.(stream)
      console.log('Camera started with constraints:', constraints)
      
      // Log actual settings
      const videoTrack = stream.getVideoTracks()[0]
      console.log('Actual settings:', videoTrack.getSettings())
      
    } catch (err) {
      console.error('Failed to start camera:', err)
    }
  }

  // 3. Switch camera
  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    startCamera({
      video: {
        facingMode: newMode,
        width: resolution.width,
        height: resolution.height,
        frameRate
      },
      audio: audioEnabled
    })
  }

  // 4. Change resolution
  const changeResolution = (width: number, height: number) => {
    setResolution({ width, height })
    startCamera({
      video: {
        width: { exact: width },
        height: { exact: height },
        facingMode,
        frameRate
      },
      audio: audioEnabled
    })
  }

  // 5. Change frame rate
  const changeFrameRate = (fps: number) => {
    setFrameRate(fps)
    startCamera({
      video: {
        width: resolution.width,
        height: resolution.height,
        facingMode,
        frameRate: { exact: fps }
      },
      audio: audioEnabled
    })
  }

  // 6. Toggle audio
  const toggleAudio = () => {
    const newAudioState = !audioEnabled
    setAudioEnabled(newAudioState)
    startCamera({
      video: {
        width: resolution.width,
        height: resolution.height,
        facingMode,
        frameRate
      },
      audio: newAudioState
    })
  }

  // 7. Start/stop recording
  const toggleRecording = () => {
    if (!isRecording && currentStream) {
      const recorder = new MediaRecorder(currentStream)
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recording-${Date.now()}.webm`
        a.click()
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } else if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // 8. Capture photo with zoom
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Apply digital zoom
    if (digitalZoom > 1) {
      const zoomWidth = video.videoWidth / digitalZoom
      const zoomHeight = video.videoHeight / digitalZoom
      const offsetX = (video.videoWidth - zoomWidth) / 2
      const offsetY = (video.videoHeight - zoomHeight) / 2
      
      ctx.drawImage(
        video,
        offsetX, offsetY, zoomWidth, zoomHeight,
        0, 0, canvas.width, canvas.height
      )
    } else {
      ctx.drawImage(video, 0, 0)
    }
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`
    ctx.drawImage(canvas, 0, 0)
    
    // Download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-${Date.now()}.jpg`
      a.click()
    }, 'image/jpeg', 0.95)
  }

  // 9. Burst mode capture
  const captureBurst = async () => {
    setBurstMode(true)
    for (let i = 0; i < burstCount; i++) {
      capturePhoto()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setBurstMode(false)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden elements for processing */}
      <video ref={videoRef} className="hidden" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Basic Camera Controls */}
      <Card className="bg-background border-border p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase">Basic Controls</h3>
          </div>
          
          {/* Camera list */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Cameras found: {cameras.length}
            </div>
            <Button
              size="sm"
              onClick={enumerateCameras}
              className="w-full h-7 text-xs"
            >
              Refresh Cameras
            </Button>
          </div>
          
          {/* Facing mode switch */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Camera:</span>
            <Button
              size="sm"
              onClick={switchCamera}
              className="h-6 text-xs"
            >
              {facingMode === 'user' ? 'Front' : 'Back'}
            </Button>
          </div>
          
          {/* Resolution presets */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Resolution:</span>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={resolution.width === 640 ? "default" : "outline"}
                onClick={() => changeResolution(640, 480)}
                className="h-6 text-xs"
              >
                VGA
              </Button>
              <Button
                size="sm"
                variant={resolution.width === 1280 ? "default" : "outline"}
                onClick={() => changeResolution(1280, 720)}
                className="h-6 text-xs"
              >
                720p
              </Button>
              <Button
                size="sm"
                variant={resolution.width === 1920 ? "default" : "outline"}
                onClick={() => changeResolution(1920, 1080)}
                className="h-6 text-xs"
              >
                1080p
              </Button>
              <Button
                size="sm"
                variant={resolution.width === 3840 ? "default" : "outline"}
                onClick={() => changeResolution(3840, 2160)}
                className="h-6 text-xs"
              >
                4K
              </Button>
            </div>
          </div>
          
          {/* Frame rate */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Frame Rate:</span>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant={frameRate === 15 ? "default" : "outline"}
                onClick={() => changeFrameRate(15)}
                className="h-6 text-xs"
              >
                15fps
              </Button>
              <Button
                size="sm"
                variant={frameRate === 30 ? "default" : "outline"}
                onClick={() => changeFrameRate(30)}
                className="h-6 text-xs"
              >
                30fps
              </Button>
              <Button
                size="sm"
                variant={frameRate === 60 ? "default" : "outline"}
                onClick={() => changeFrameRate(60)}
                className="h-6 text-xs"
              >
                60fps
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Audio & Recording */}
      <Card className="bg-background border-border p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase">Audio & Recording</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs flex items-center gap-1">
              <Mic className="h-3 w-3" />
              Audio
            </span>
            <Switch
              checked={audioEnabled}
              onCheckedChange={toggleAudio}
            />
          </div>
          
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            className="w-full h-7 text-xs"
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          
          <Button
            size="sm"
            onClick={capturePhoto}
            className="w-full h-7 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Capture Photo
          </Button>
        </div>
      </Card>
      
      {/* Digital Zoom & Filters */}
      <Card className="bg-background border-border p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase">Digital Zoom & Filters</h3>
          </div>
          
          {/* Digital Zoom */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Zoom</span>
              <span>{digitalZoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[digitalZoom]}
              min={1}
              max={5}
              step={0.1}
              onValueChange={(v) => setDigitalZoom(v[0])}
            />
          </div>
          
          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Brightness</span>
              <span>{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={50}
              max={150}
              step={5}
              onValueChange={(v) => setBrightness(v[0])}
            />
          </div>
          
          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Contrast</span>
              <span>{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              min={50}
              max={150}
              step={5}
              onValueChange={(v) => setContrast(v[0])}
            />
          </div>
          
          {/* Blur */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Blur</span>
              <span>{blur}px</span>
            </div>
            <Slider
              value={[blur]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={(v) => setBlur(v[0])}
            />
          </div>
        </div>
      </Card>
      
      {/* Advanced Features */}
      <Card className="bg-background border-border p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase">Advanced Features</h3>
          </div>
          
          {/* Burst Mode */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Burst shots:</span>
              <span>{burstCount}</span>
            </div>
            <Slider
              value={[burstCount]}
              min={3}
              max={10}
              step={1}
              onValueChange={(v) => setBurstCount(v[0])}
            />
            <Button
              size="sm"
              onClick={captureBurst}
              disabled={burstMode}
              className="w-full h-7 text-xs"
            >
              {burstMode ? 'Capturing...' : `Burst (${burstCount} shots)`}
            </Button>
          </div>
          
          {/* Screen Capture (iPad only) */}
          <Button
            size="sm"
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                  video: true,
                  audio: false
                })
                console.log('Screen capture started', stream)
              } catch (err) {
                console.error('Screen capture failed (iPad only):', err)
              }
            }}
            className="w-full h-7 text-xs"
          >
            Screen Capture (iPad)
          </Button>
          
          {/* ImageCapture API test */}
          <Button
            size="sm"
            onClick={() => {
              if ('ImageCapture' in window) {
                console.log('ImageCapture API available!')
              } else {
                console.log('ImageCapture API not available')
              }
            }}
            className="w-full h-7 text-xs"
          >
            Test ImageCapture API
          </Button>
        </div>
      </Card>
      
      {/* Continuity Camera (Mac) */}
      <Card className="bg-background border-border p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase">Continuity Camera</h3>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>If using iPhone as Mac webcam:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Center Stage: Auto-framing</li>
              <li>Portrait Mode: Background blur</li>
              <li>Studio Light: Better lighting</li>
              <li>Desk View: Overhead camera</li>
            </ul>
            <p className="text-[10px] pt-1">
              These are controlled by macOS, not web API
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}