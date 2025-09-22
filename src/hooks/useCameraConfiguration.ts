"use client"

import { useState, useCallback, useEffect } from 'react'

import { type CameraConfiguration, DEFAULT_CAMERA_CONFIG, validateCameraConfig } from '@/lib/camera/camera-config'

const STORAGE_KEY = 'camera-configuration'

export function useCameraConfiguration(): { config: CameraConfiguration; updateConfig: (updates: Partial<CameraConfiguration>) => void; resetConfig: () => void; isLoading: boolean } {
  const [config, setConfig] = useState<CameraConfiguration>(DEFAULT_CAMERA_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as unknown
        setConfig(validateCameraConfig(parsed as Partial<CameraConfiguration>))
      }
    } catch (error) {
      console.error('Failed to load camera configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save configuration to localStorage
  const saveConfig = useCallback((newConfig: CameraConfiguration) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    } catch (error) {
      console.error('Failed to save camera configuration:', error)
    }
  }, [])

  // Update configuration
  const updateConfig = useCallback((updates: Partial<CameraConfiguration>) => {
    setConfig(prevConfig => {
      const newConfig = validateCameraConfig({ ...prevConfig, ...updates })
      saveConfig(newConfig)
      return newConfig
    })
  }, [saveConfig])

  // Reset to defaults
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CAMERA_CONFIG)
    saveConfig(DEFAULT_CAMERA_CONFIG)
  }, [saveConfig])

  return {
    config,
    updateConfig,
    resetConfig,
    isLoading
  }
}