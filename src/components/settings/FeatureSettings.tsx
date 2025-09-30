"use client"

import { Save, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'

export function FeatureSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const { toast } = useToast()
  
  const [enableAI, setEnableAI] = useState(settings.features.enableAI)
  const [enableCloudStorage, setEnableCloudStorage] = useState(settings.features.enableCloudStorage)
  const [enableExport, setEnableExport] = useState(settings.features.enableExport)
  const [enableImport, setEnableImport] = useState(settings.features.enableImport)
  const [debugMode, setDebugMode] = useState(settings.features.debugMode)
  
  const handleSave = () => {
    updateSettings({
      features: {
        enableAI,
        enableCloudStorage,
        enableExport,
        enableImport,
        debugMode
      }
    })
    
    toast({
      title: "Settings saved",
      description: "Feature settings have been updated successfully.",
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enable or disable application features
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="enableAI" className="text-base font-medium">
              AI Product Analysis
            </Label>
            <p className="text-sm text-muted-foreground">
              Use AI to automatically identify and analyze products from images
            </p>
          </div>
          <Switch
            id="enableAI"
            checked={enableAI}
            onCheckedChange={setEnableAI}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="enableCloudStorage" className="text-base font-medium">
              Cloud Storage
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable cloud storage providers (MinIO, S3, Cloudinary)
            </p>
          </div>
          <Switch
            id="enableCloudStorage"
            checked={enableCloudStorage}
            onCheckedChange={setEnableCloudStorage}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="enableExport" className="text-base font-medium">
              Export Functionality
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow exporting inventory data to CSV, Excel, or PDF
            </p>
          </div>
          <Switch
            id="enableExport"
            checked={enableExport}
            onCheckedChange={setEnableExport}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="enableImport" className="text-base font-medium">
              Import Functionality
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow importing inventory data from CSV or Excel files
            </p>
          </div>
          <Switch
            id="enableImport"
            checked={enableImport}
            onCheckedChange={setEnableImport}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-500/30 bg-yellow-500/5">
          <div className="space-y-0.5">
            <Label htmlFor="debugMode" className="text-base font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Debug Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Show debug information and developer tools
            </p>
          </div>
          <Switch
            id="debugMode"
            checked={debugMode}
            onCheckedChange={setDebugMode}
          />
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