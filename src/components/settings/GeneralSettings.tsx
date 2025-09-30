"use client"

import { useState } from 'react'
import { Save, Globe, Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'

export function GeneralSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const { toast } = useToast()
  
  const [appName, setAppName] = useState(settings.appName)
  const [appUrl, setAppUrl] = useState(settings.appUrl)
  const [language, setLanguage] = useState(settings.language)
  const [theme, setTheme] = useState(settings.theme)
  
  const handleSave = () => {
    updateSettings({
      appName,
      appUrl,
      language,
      theme
    })
    
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    })
    
    // Apply theme if changed
    if (theme !== settings.theme) {
      applyTheme(theme)
    }
  }
  
  const applyTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // Auto theme based on system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure basic application settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="appName">Application Name</Label>
          <Input
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Inventiq"
          />
          <p className="text-xs text-muted-foreground">
            The name displayed throughout the application
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appUrl">Application URL</Label>
          <Input
            id="appUrl"
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
            placeholder="https://inventiq.example.com"
          />
          <p className="text-xs text-muted-foreground">
            The public URL where the application is hosted
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">
            <Globe className="w-4 h-4 inline mr-2" />
            Language
          </Label>
          <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose your preferred language
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="theme">
            <Palette className="w-4 h-4 inline mr-2" />
            Theme
          </Label>
          <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="auto">Auto (System)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color theme
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}