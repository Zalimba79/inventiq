import { CapturedPhoto } from '@/types/capture'

export interface UploadTask {
  id: string
  photo: CapturedPhoto
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  progress: number
  error?: string
  url?: string
}

export class UploadQueue {
  private queue: UploadTask[] = []
  private isProcessing = false
  private maxConcurrent = 3
  private activeUploads = 0
  private listeners: ((queue: UploadTask[]) => void)[] = []

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent
  }

  addToQueue(photo: CapturedPhoto): string {
    const task: UploadTask = {
      id: `upload-${Date.now()}-${Math.random()}`,
      photo,
      status: 'pending',
      progress: 0
    }

    this.queue.push(task)
    this.notifyListeners()
    this.processQueue()

    return task.id
  }

  private async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.queue.length > 0 && this.activeUploads < this.maxConcurrent) {
      const pendingTask = this.queue.find(t => t.status === 'pending')
      if (!pendingTask) break

      this.activeUploads++
      this.uploadPhoto(pendingTask)
    }

    this.isProcessing = false
  }

  private async uploadPhoto(task: UploadTask) {
    try {
      // Update status to uploading
      task.status = 'uploading'
      this.notifyListeners()

      // Convert base64 to blob
      const base64Data = task.photo.dataUrl.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: task.photo.mimeType })

      // Create form data
      const formData = new FormData()
      formData.append('file', blob, task.photo.fileName)
      formData.append('timestamp', task.photo.timestamp.toISOString())

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (task.progress < 90) {
          task.progress += Math.random() * 20
          this.notifyListeners()
        }
      }, 200)

      // In a real implementation, this would upload to your server
      // For now, we'll simulate an upload with a delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)

      // Mark as completed
      task.status = 'completed'
      task.progress = 100
      task.url = task.photo.dataUrl // In real app, this would be the server URL
      this.notifyListeners()

    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Upload failed'
      this.notifyListeners()
    } finally {
      this.activeUploads--
      this.processQueue()
    }
  }

  retry(taskId: string) {
    const task = this.queue.find(t => t.id === taskId)
    if (task && task.status === 'failed') {
      task.status = 'pending'
      task.progress = 0
      task.error = undefined
      this.notifyListeners()
      this.processQueue()
    }
  }

  remove(taskId: string) {
    this.queue = this.queue.filter(t => t.id !== taskId)
    this.notifyListeners()
  }

  clear() {
    this.queue = []
    this.notifyListeners()
  }

  getQueue(): UploadTask[] {
    return [...this.queue]
  }

  subscribe(listener: (queue: UploadTask[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getQueue()))
  }
}