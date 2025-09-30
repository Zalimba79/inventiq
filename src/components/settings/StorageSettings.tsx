"use client"

import { useState, useEffect } from 'react'
import { Save, TestTube, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'

export function StorageSettings() {
  const { settings, updateStorageSettings } = useSettingsStore()
  const { toast } = useToast()
  
  const [provider, setProvider] = useState(settings.storage.provider)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  
  // MinIO settings
  const [minioEndpoint, setMinioEndpoint] = useState(settings.storage.minio?.endpoint || '')
  const [minioPublicUrl, setMinioPublicUrl] = useState(settings.storage.minio?.publicUrl || '')
  const [minioBucket, setMinioBucket] = useState(settings.storage.minio?.bucket || 'inventiq-assets')
  const [minioAccessKey, setMinioAccessKey] = useState(settings.storage.minio?.accessKey || '')
  const [minioSecretKey, setMinioSecretKey] = useState(settings.storage.minio?.secretKey || '')
  const [minioRegion, setMinioRegion] = useState(settings.storage.minio?.region || 'us-east-1')
  const [minioUseSSL, setMinioUseSSL] = useState(settings.storage.minio?.useSSL || false)
  
  const handleSave = () => {
    updateStorageSettings({
      provider,
      minio: provider === 'minio' ? {
        endpoint: minioEndpoint,
        publicUrl: minioPublicUrl || minioEndpoint, // Use endpoint as fallback
        bucket: minioBucket,
        accessKey: minioAccessKey,
        secretKey: minioSecretKey,
        region: minioRegion,
        useSSL: minioUseSSL
      } : settings.storage.minio
    })
    
    toast({
      title: "Settings saved",
      description: "Storage settings have been updated successfully.",
    })
  }
  
  const testConnection = async () => {
    if (provider !== 'minio') return
    
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: minioEndpoint,
          bucket: minioBucket,
          accessKey: minioAccessKey,
          secretKey: minioSecretKey,
          region: minioRegion
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setTestResult('success')
        toast({
          title: "Connection successful",
          description: "MinIO connection test passed successfully.",
        })
      } else {
        setTestResult('error')
        toast({
          title: "Connection failed",
          description: result.error || "Failed to connect to MinIO",
          variant: "destructive"
        })
      }
    } catch (error) {
      setTestResult('error')
      toast({
        title: "Connection failed",
        description: "Failed to test MinIO connection",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Storage Configuration</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure where your product images and files are stored
        </p>
      </div>
      
      {/* Storage Provider Selection */}
      <div className="space-y-3">
        <Label>Storage Provider</Label>
        <RadioGroup value={provider} onValueChange={(value: any) => setProvider(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local" className="font-normal">
              Local Storage (Browser only, limited capacity)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="minio" id="minio" />
            <Label htmlFor="minio" className="font-normal">
              MinIO / S3 Compatible Storage (Recommended for production)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cloudinary" id="cloudinary" disabled />
            <Label htmlFor="cloudinary" className="font-normal text-muted-foreground">
              Cloudinary (Coming soon)
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* MinIO Configuration */}
      {provider === 'minio' && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold flex items-center gap-2">
            MinIO Configuration
            {testResult === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {testResult === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="http://localhost:9000"
                value={minioEndpoint}
                onChange={(e) => setMinioEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The MinIO server endpoint (internal address)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publicUrl">Public URL (Optional)</Label>
              <Input
                id="publicUrl"
                placeholder="https://cdn.example.com"
                value={minioPublicUrl}
                onChange={(e) => setMinioPublicUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Public URL for serving images (if different from endpoint)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bucket">Bucket Name</Label>
              <Input
                id="bucket"
                placeholder="inventiq-assets"
                value={minioBucket}
                onChange={(e) => setMinioBucket(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="us-east-1"
                value={minioRegion}
                onChange={(e) => setMinioRegion(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                placeholder="minioadmin"
                value={minioAccessKey}
                onChange={(e) => setMinioAccessKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="••••••••"
                  value={minioSecretKey}
                  onChange={(e) => setMinioSecretKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="useSSL"
              checked={minioUseSSL}
              onCheckedChange={setMinioUseSSL}
            />
            <Label htmlFor="useSSL">Use SSL/TLS</Label>
          </div>
          
          <Alert>
            <AlertDescription>
              Make sure your MinIO server is accessible from this application.
              For production, use a secure connection (HTTPS) and strong credentials.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Local Storage Warning */}
      {provider === 'local' && (
        <Alert>
          <AlertDescription>
            Local storage is limited to ~5-10MB and data is only stored in your browser.
            For production use, we recommend using MinIO or cloud storage.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
        
        {provider === 'minio' && (
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={isTesting || !minioEndpoint || !minioAccessKey || !minioSecretKey}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}