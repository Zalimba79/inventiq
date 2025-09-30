"use client"

import { Settings, Database, Cloud, Brain, Shield, Info } from 'lucide-react'
import { useState } from 'react'

import { StorageSettings } from '@/components/settings/StorageSettings'
import { AISettings } from '@/components/settings/AISettings'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { DatabaseSettings } from '@/components/settings/DatabaseSettings'
import { FeatureSettings } from '@/components/settings/FeatureSettings'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your Inventiq application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <TabsContent value="general" className="space-y-6 mt-0">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="storage" className="space-y-6 mt-0">
            <StorageSettings />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6 mt-0">
            <AISettings />
          </TabsContent>

          <TabsContent value="database" className="space-y-6 mt-0">
            <DatabaseSettings />
          </TabsContent>

          <TabsContent value="features" className="space-y-6 mt-0">
            <FeatureSettings />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}