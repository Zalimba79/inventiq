"use client"

import { useState } from 'react'
import { Save, Database, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'

export function DatabaseSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const { toast } = useToast()
  
  const [provider, setProvider] = useState(settings.database.provider)
  const [connectionString, setConnectionString] = useState(settings.database.connectionString || '')
  
  const handleSave = () => {
    updateSettings({
      database: {
        provider,
        connectionString
      }
    })
    
    toast({
      title: "Settings saved",
      description: "Database settings have been updated successfully.",
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Database Configuration</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure database connection for advanced features
        </p>
      </div>
      
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <strong>Advanced Users Only:</strong> Database configuration is optional.
          The application works with browser storage by default.
        </AlertDescription>
      </Alert>
      
      {/* Database Provider Selection */}
      <div className="space-y-3">
        <Label>Database Provider</Label>
        <RadioGroup value={provider} onValueChange={(value: any) => setProvider(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="postgresql" id="postgresql" />
            <Label htmlFor="postgresql" className="font-normal">
              PostgreSQL (Recommended)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mysql" id="mysql" disabled />
            <Label htmlFor="mysql" className="font-normal text-muted-foreground">
              MySQL (Coming soon)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sqlite" id="sqlite" disabled />
            <Label htmlFor="sqlite" className="font-normal text-muted-foreground">
              SQLite (Coming soon)
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* PostgreSQL Configuration */}
      {provider === 'postgresql' && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            PostgreSQL Configuration
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <Input
              id="connectionString"
              type="password"
              placeholder="postgresql://user:password@host:5432/database"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Format: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
            </p>
          </div>
          
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p>For Docker setup, use:</p>
                <code className="block bg-muted px-2 py-1 rounded text-xs">
                  postgresql://inventiq:inventiq2025@localhost:5432/inventiq
                </code>
                <p className="text-xs">
                  Make sure to run migrations after configuring the database.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="flex gap-3">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}