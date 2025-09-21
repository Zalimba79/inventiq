import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CapturedPhoto, CaptureSession } from '@/types/capture'
import { v4 as uuidv4 } from 'uuid'

interface CaptureStore {
  currentSession: CaptureSession | null
  sessions: CaptureSession[]
  
  // Session management
  startSession: () => void
  endSession: () => void
  cancelSession: () => void
  clearSession: () => void
  
  // Photo management
  addPhoto: (photo: Omit<CapturedPhoto, 'id'>) => void
  removePhoto: (photoId: string) => void
  clearPhotos: () => void
  
  // Session history
  getSessions: () => CaptureSession[]
  getSessionById: (id: string) => CaptureSession | undefined
  clearHistory: () => void
}

export const useCaptureStore = create<CaptureStore>()(
  persist(
    (set, get) => ({
  currentSession: null,
  sessions: [],
  
  startSession: () => {
    const newSession: CaptureSession = {
      id: uuidv4(),
      photos: [],
      startTime: new Date(),
      status: 'active'
    }
    set({ currentSession: newSession })
  },
  
  endSession: () => {
    const { currentSession, sessions } = get()
    if (currentSession) {
      const completedSession: CaptureSession = {
        ...currentSession,
        endTime: new Date(),
        status: 'completed'
      }
      set({
        sessions: [...sessions, completedSession],
        currentSession: null
      })
    }
  },
  
  cancelSession: () => {
    set({ currentSession: null })
  },
  
  clearSession: () => {
    set({ currentSession: null })
  },
  
  addPhoto: (photo) => {
    const { currentSession } = get()
    if (currentSession) {
      const newPhoto: CapturedPhoto = {
        ...photo,
        id: uuidv4()
      }
      set({
        currentSession: {
          ...currentSession,
          photos: [...currentSession.photos, newPhoto]
        }
      })
    }
  },
  
  removePhoto: (photoId) => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          photos: currentSession.photos.filter(p => p.id !== photoId)
        }
      })
    }
  },
  
  clearPhotos: () => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          photos: []
        }
      })
    }
  },
  
  getSessions: () => get().sessions,
  
  getSessionById: (id) => get().sessions.find(s => s.id === id),
  
  clearHistory: () => set({ sessions: [] })
    }),
    {
      name: 'capture-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        sessions: state.sessions
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            return JSON.parse(str)
          } catch (e) {
            console.error('Error parsing capture storage:', e)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        }
      }
    }
  )
)