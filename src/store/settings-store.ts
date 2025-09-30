import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StorageSettings {
  provider: 'minio' | 'local' | 'cloudinary'
  minio?: {
    endpoint: string
    publicUrl: string
    bucket: string
    accessKey: string
    secretKey: string
    region: string
    useSSL: boolean
  }
  cloudinary?: {
    cloudName: string
    apiKey: string
    apiSecret: string
  }
}

export interface AppSettings {
  // General settings
  appName: string
  appUrl: string
  language: 'en' | 'de' | 'fr' | 'es'
  theme: 'light' | 'dark' | 'auto'
  
  // Storage settings
  storage: StorageSettings
  
  // AI settings
  ai: {
    provider: 'openai' | 'google' | 'local'
    openaiApiKey?: string
    googleApiKey?: string
    confidenceThreshold: number
    maxRetries: number
  }
  
  // Database settings (for advanced users)
  database: {
    provider: 'postgresql' | 'sqlite' | 'mysql'
    connectionString?: string
  }
  
  // Feature flags
  features: {
    enableAI: boolean
    enableCloudStorage: boolean
    enableExport: boolean
    enableImport: boolean
    debugMode: boolean
  }
}

interface SettingsStore {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  updateStorageSettings: (updates: Partial<StorageSettings>) => void
  updateAISettings: (updates: Partial<AppSettings['ai']>) => void
  resetSettings: () => void
  isConfigured: () => boolean
}

const defaultSettings: AppSettings = {
  appName: 'Inventiq',
  appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  language: 'en',
  theme: 'auto',
  
  storage: {
    provider: 'local',
    minio: {
      endpoint: '',
      publicUrl: '',
      bucket: 'inventiq-assets',
      accessKey: '',
      secretKey: '',
      region: 'us-east-1',
      useSSL: false
    }
  },
  
  ai: {
    provider: 'openai',
    openaiApiKey: '',
    confidenceThreshold: 0.7,
    maxRetries: 3
  },
  
  database: {
    provider: 'postgresql',
    connectionString: ''
  },
  
  features: {
    enableAI: true,
    enableCloudStorage: false,
    enableExport: true,
    enableImport: true,
    debugMode: false
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates
          }
        })),
      
      updateStorageSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            storage: {
              ...state.settings.storage,
              ...updates,
              // Deep merge for nested objects like minio
              minio: updates.minio ? {
                ...state.settings.storage.minio,
                ...updates.minio
              } : state.settings.storage.minio
            }
          }
        })),
      
      updateAISettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ai: {
              ...state.settings.ai,
              ...updates
            }
          }
        })),
      
      resetSettings: () =>
        set(() => ({
          settings: defaultSettings
        })),
      
      isConfigured: () => {
        const { settings } = get()
        
        // Check if essential settings are configured
        if (settings.storage.provider === 'minio') {
          return !!(
            settings.storage.minio?.endpoint &&
            settings.storage.minio?.accessKey &&
            settings.storage.minio?.secretKey
          )
        }
        
        if (settings.ai.provider === 'openai') {
          return !!settings.ai.openaiApiKey
        }
        
        return true // Local storage doesn't need configuration
      }
    }),
    {
      name: 'inventiq-settings',
      version: 1
    }
  )
)