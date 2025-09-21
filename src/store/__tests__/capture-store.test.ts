import { act, renderHook } from '@testing-library/react'
import { useCaptureStore } from '../capture-store'
import { CapturedPhoto } from '@/types/capture'

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}))

describe('useCaptureStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useCaptureStore())
    act(() => {
      result.current.cancelSession()
      result.current.clearHistory()
    })
  })

  describe('Session Management', () => {
    it('starts a new session', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
      })

      expect(result.current.currentSession).toEqual(
        expect.objectContaining({
          id: 'mock-uuid',
          photos: [],
          status: 'active'
        })
      )
    })

    it('ends current session and adds to history', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
      })

      const session = result.current.currentSession

      act(() => {
        result.current.endSession()
      })

      expect(result.current.currentSession).toBeNull()
      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions[0]).toEqual(
        expect.objectContaining({
          ...session,
          status: 'completed',
          endTime: expect.any(Date)
        })
      )
    })

    it('cancels current session without saving', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
      })

      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.currentSession).toBeNull()
      expect(result.current.sessions).toHaveLength(0)
    })
  })

  describe('Photo Management', () => {
    it('adds photo to current session', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
      })

      const photoData = {
        dataUrl: 'data:image/jpeg;base64,test',
        timestamp: new Date(),
        fileName: 'test.jpg',
        size: 1000,
        mimeType: 'image/jpeg'
      }

      act(() => {
        result.current.addPhoto(photoData)
      })

      expect(result.current.currentSession?.photos).toHaveLength(1)
      expect(result.current.currentSession?.photos[0]).toEqual(
        expect.objectContaining({
          ...photoData,
          id: 'mock-uuid'
        })
      )
    })

    it('does not add photo when no session is active', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      const photoData = {
        dataUrl: 'data:image/jpeg;base64,test',
        timestamp: new Date(),
        fileName: 'test.jpg',
        size: 1000,
        mimeType: 'image/jpeg'
      }

      act(() => {
        result.current.addPhoto(photoData)
      })

      expect(result.current.currentSession).toBeNull()
    })

    it('removes photo from current session', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
        result.current.addPhoto({
          dataUrl: 'test1',
          timestamp: new Date(),
          fileName: 'test1.jpg',
          size: 1000,
          mimeType: 'image/jpeg'
        })
      })

      const photoId = result.current.currentSession?.photos[0].id

      act(() => {
        result.current.removePhoto(photoId!)
      })

      expect(result.current.currentSession?.photos).toHaveLength(0)
    })

    it('clears all photos from current session', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
        result.current.addPhoto({
          dataUrl: 'test1',
          timestamp: new Date(),
          fileName: 'test1.jpg',
          size: 1000,
          mimeType: 'image/jpeg'
        })
        result.current.addPhoto({
          dataUrl: 'test2',
          timestamp: new Date(),
          fileName: 'test2.jpg',
          size: 1000,
          mimeType: 'image/jpeg'
        })
      })

      expect(result.current.currentSession?.photos).toHaveLength(2)

      act(() => {
        result.current.clearPhotos()
      })

      expect(result.current.currentSession?.photos).toHaveLength(0)
    })
  })

  describe('Session History', () => {
    it('gets all sessions', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      // Create and complete multiple sessions
      act(() => {
        result.current.startSession()
        result.current.endSession()
        result.current.startSession()
        result.current.endSession()
      })

      const sessions = result.current.getSessions()
      expect(sessions).toHaveLength(2)
    })

    it('gets session by ID', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
      })

      const sessionId = result.current.currentSession?.id

      act(() => {
        result.current.endSession()
      })

      const session = result.current.getSessionById(sessionId!)
      expect(session).toBeDefined()
      expect(session?.id).toBe(sessionId)
    })

    it('returns undefined for non-existent session ID', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      const session = result.current.getSessionById('non-existent')
      expect(session).toBeUndefined()
    })

    it('clears all session history', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
        result.current.endSession()
        result.current.startSession()
        result.current.endSession()
      })

      expect(result.current.sessions).toHaveLength(2)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.sessions).toHaveLength(0)
    })
  })

  describe('Complex Scenarios', () => {
    it('handles multiple photos in a session', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      act(() => {
        result.current.startSession()
        
        for (let i = 0; i < 5; i++) {
          result.current.addPhoto({
            dataUrl: `test${i}`,
            timestamp: new Date(),
            fileName: `test${i}.jpg`,
            size: 1000 * (i + 1),
            mimeType: 'image/jpeg'
          })
        }
      })

      expect(result.current.currentSession?.photos).toHaveLength(5)
      
      act(() => {
        result.current.endSession()
      })

      const completedSession = result.current.sessions[0]
      expect(completedSession.photos).toHaveLength(5)
      expect(completedSession.status).toBe('completed')
    })

    it('maintains separate session states', () => {
      const { result } = renderHook(() => useCaptureStore())
      
      // First session
      act(() => {
        result.current.startSession()
        result.current.addPhoto({
          dataUrl: 'session1',
          timestamp: new Date(),
          fileName: 'session1.jpg',
          size: 1000,
          mimeType: 'image/jpeg'
        })
        result.current.endSession()
      })

      // Second session
      act(() => {
        result.current.startSession()
        result.current.addPhoto({
          dataUrl: 'session2',
          timestamp: new Date(),
          fileName: 'session2.jpg',
          size: 2000,
          mimeType: 'image/jpeg'
        })
        result.current.endSession()
      })

      expect(result.current.sessions).toHaveLength(2)
      expect(result.current.sessions[0].photos[0].dataUrl).toBe('session1')
      expect(result.current.sessions[1].photos[0].dataUrl).toBe('session2')
    })
  })
})