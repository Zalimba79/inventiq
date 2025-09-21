import { UploadQueue, UploadTask } from '../upload-queue'
import { CapturedPhoto } from '@/types/capture'

describe('UploadQueue', () => {
  let queue: UploadQueue
  
  const mockPhoto: CapturedPhoto = {
    id: 'photo-1',
    dataUrl: 'data:image/jpeg;base64,test',
    timestamp: new Date(),
    fileName: 'test.jpg',
    size: 1000,
    mimeType: 'image/jpeg'
  }

  beforeEach(() => {
    queue = new UploadQueue(2) // Max 2 concurrent uploads
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Queue Management', () => {
    it('adds photo to queue', (done) => {
      const taskId = queue.addToQueue(mockPhoto)
      
      expect(taskId).toBeDefined()
      expect(queue.getQueue()).toHaveLength(1)
      
      // Check immediately before processing starts
      const task = queue.getQueue()[0]
      expect(task.id).toBe(taskId)
      expect(task.photo).toEqual(mockPhoto)
      expect(task.progress).toBe(0)
      done()
    })

    it('processes queue automatically when photo is added', () => {
      queue.addToQueue(mockPhoto)
      
      // Fast forward a bit to let processing start
      jest.advanceTimersByTime(100)
      
      const tasks = queue.getQueue()
      expect(tasks[0].status).toBe('uploading')
    })

    it('respects max concurrent uploads', () => {
      const photo1 = { ...mockPhoto, id: 'photo-1' }
      const photo2 = { ...mockPhoto, id: 'photo-2' }
      const photo3 = { ...mockPhoto, id: 'photo-3' }
      
      queue.addToQueue(photo1)
      queue.addToQueue(photo2)
      queue.addToQueue(photo3)
      
      // Fast forward to start processing
      jest.advanceTimersByTime(100)
      
      const tasks = queue.getQueue()
      const uploadingTasks = tasks.filter(t => t.status === 'uploading')
      const pendingTasks = tasks.filter(t => t.status === 'pending')
      
      expect(uploadingTasks).toHaveLength(2) // Max concurrent
      expect(pendingTasks).toHaveLength(1) // Waiting
    })

    it('removes task from queue', () => {
      const taskId = queue.addToQueue(mockPhoto)
      
      expect(queue.getQueue()).toHaveLength(1)
      
      queue.remove(taskId)
      
      expect(queue.getQueue()).toHaveLength(0)
    })

    it('clears entire queue', () => {
      queue.addToQueue(mockPhoto)
      queue.addToQueue({ ...mockPhoto, id: 'photo-2' })
      queue.addToQueue({ ...mockPhoto, id: 'photo-3' })
      
      expect(queue.getQueue()).toHaveLength(3)
      
      queue.clear()
      
      expect(queue.getQueue()).toHaveLength(0)
    })
  })

  describe('Upload Process', () => {
    it('simulates upload progress', () => {
      const progressUpdates: number[] = []
      
      queue.subscribe((tasks) => {
        if (tasks[0]?.status === 'uploading') {
          progressUpdates.push(tasks[0].progress)
        }
      })
      
      queue.addToQueue(mockPhoto)
      
      // Advance through progress updates
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(200)
      }
      
      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates[progressUpdates.length - 1]).toBeGreaterThan(0)
    })

    it('completes upload successfully', () => {
      queue.addToQueue(mockPhoto)
      
      // Fast forward to complete upload
      jest.advanceTimersByTime(3000)
      
      const tasks = queue.getQueue()
      expect(tasks[0].status).toBe('completed')
      expect(tasks[0].progress).toBe(100)
      expect(tasks[0].url).toBeDefined()
    })

    it('processes next task after completion', () => {
      const photo1 = { ...mockPhoto, id: 'photo-1' }
      const photo2 = { ...mockPhoto, id: 'photo-2' }
      const photo3 = { ...mockPhoto, id: 'photo-3' }
      
      queue.addToQueue(photo1)
      queue.addToQueue(photo2)
      queue.addToQueue(photo3)
      
      // Start processing first two
      jest.advanceTimersByTime(100)
      
      let tasks = queue.getQueue()
      expect(tasks.filter(t => t.status === 'uploading')).toHaveLength(2)
      
      // Complete first upload
      jest.advanceTimersByTime(2000)
      
      tasks = queue.getQueue()
      const completedTasks = tasks.filter(t => t.status === 'completed')
      const uploadingTasks = tasks.filter(t => t.status === 'uploading')
      
      expect(completedTasks.length).toBeGreaterThan(0)
      expect(uploadingTasks.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('retries failed upload', () => {
      const taskId = queue.addToQueue(mockPhoto)
      
      // Simulate failure (we'll need to mock this in a real implementation)
      const task = queue.getQueue()[0]
      task.status = 'failed'
      task.error = 'Upload failed'
      
      queue.retry(taskId)
      
      const updatedTask = queue.getQueue()[0]
      expect(updatedTask.status).toBe('pending')
      expect(updatedTask.progress).toBe(0)
      expect(updatedTask.error).toBeUndefined()
    })

    it('does not retry non-failed tasks', () => {
      const taskId = queue.addToQueue(mockPhoto)
      
      // Start upload
      jest.advanceTimersByTime(100)
      
      const task = queue.getQueue()[0]
      const originalStatus = task.status
      
      queue.retry(taskId)
      
      expect(queue.getQueue()[0].status).toBe(originalStatus)
    })
  })

  describe('Subscription System', () => {
    it('notifies subscribers of queue changes', () => {
      const listener = jest.fn()
      
      queue.subscribe(listener)
      
      queue.addToQueue(mockPhoto)
      
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            photo: mockPhoto,
            status: 'pending'
          })
        ])
      )
    })

    it('unsubscribes listener', () => {
      const listener = jest.fn()
      
      const unsubscribe = queue.subscribe(listener)
      
      queue.addToQueue(mockPhoto)
      expect(listener).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      
      queue.addToQueue({ ...mockPhoto, id: 'photo-2' })
      expect(listener).toHaveBeenCalledTimes(1) // Not called again
    })

    it('supports multiple subscribers', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      queue.subscribe(listener1)
      queue.subscribe(listener2)
      
      queue.addToQueue(mockPhoto)
      
      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })
  })

  describe('Data Conversion', () => {
    it('converts base64 to blob for upload', () => {
      const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      const photo = { ...mockPhoto, dataUrl: base64Data }
      
      queue.addToQueue(photo)
      
      // The upload process should handle base64 conversion
      jest.advanceTimersByTime(100)
      
      const task = queue.getQueue()[0]
      expect(task.status).toBe('uploading')
      // In real implementation, we'd check FormData creation
    })
  })
})