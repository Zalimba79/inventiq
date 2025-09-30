"use client"

import { useState } from 'react'
import { Save, Eye, EyeOff, Brain } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'

export function AISettings() {
  const { settings, updateAISettings } = useSettingsStore()
  const { toast } = useToast()
  
  const [provider, setProvider] = useState(settings.ai.provider)
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.ai.openaiApiKey || '')
  const [googleApiKey, setGoogleApiKey] = useState(settings.ai.googleApiKey || '')
  const [confidenceThreshold, setConfidenceThreshold] = useState(settings.ai.confidenceThreshold)
  const [maxRetries, setMaxRetries] = useState(settings.ai.maxRetries)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const handleSave = () => {
    updateAISettings({
      provider,
      openaiApiKey: provider === 'openai' ? openaiApiKey : settings.ai.openaiApiKey,
      googleApiKey: provider === 'google' ? googleApiKey : settings.ai.googleApiKey,
      confidenceThreshold,
      maxRetries
    })
    
    toast({
      title: "Settings saved",
      description: "AI settings have been updated successfully.",
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure AI providers for product analysis and identification
        </p>
      </div>
      
      {/* AI Provider Selection */}
      <div className="space-y-3">
        <Label>AI Provider</Label>
        <RadioGroup value={provider} onValueChange={(value: any) => setProvider(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="font-normal">
              OpenAI (GPT-4 Vision)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="google" id="google" disabled />
            <Label htmlFor="google" className="font-normal text-muted-foreground">
              Google Cloud Vision (Coming soon)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" disabled />
            <Label htmlFor="local" className="font-normal text-muted-foreground">
              Local AI Model (Coming soon)
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* OpenAI Configuration */}
      {provider === 'openai' && (
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            OpenAI Configuration
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="openaiKey">API Key</Label>
            <div className="relative">
              <Input
                id="openaiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
          
          <Alert>
            <AlertDescription>
              GPT-4 Vision is used to analyze product images and extract information.
              Usage charges apply based on OpenAI's pricing.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold">Advanced Settings</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Confidence Threshold</Label>
            <span className="text-sm text-muted-foreground">{(confidenceThreshold * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[confidenceThreshold]}
            onValueChange={([value]) => setConfidenceThreshold(value)}
            min={0.5}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Minimum confidence level required for AI predictions
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Max Retries</Label>
            <span className="text-sm text-muted-foreground">{maxRetries}</span>
          </div>
          <Slider
            value={[maxRetries]}
            onValueChange={([value]) => setMaxRetries(value)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of retry attempts for failed AI requests
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