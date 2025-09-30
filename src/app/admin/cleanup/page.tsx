"use client"

import { useState } from 'react'
import { Trash2, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCleanup = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL data!\n\nAre you absolutely sure?')) {
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/clean-data', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        
        // Also clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
      } else {
        setError(data.details || 'Cleanup failed')
      }
    } catch (err) {
      setError('Failed to connect to cleanup API')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearBrowserData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          })
        })
      }
      
      alert('Browser data cleared! The page will reload.')
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Data Cleanup Utility
          </CardTitle>
          <CardDescription>
            Completely reset all data to start fresh
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone!
              <ul className="mt-2 ml-4 list-disc">
                <li>All products and photos will be deleted</li>
                <li>All analyses and tags will be removed</li>
                <li>All MinIO stored images will be deleted</li>
                <li>All user data will be cleared</li>
                <li>Browser storage will be cleared</li>
              </ul>
            </AlertDescription>
          </Alert>

          {result && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Cleanup Successful!</strong>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Database:</strong> All tables cleared
                    <ul className="ml-4 text-sm">
                      {Object.entries(result.database?.counts || {}).map(([table, count]) => (
                        <li key={table}>{table}: {count as number} records remaining</li>
                      ))}
                    </ul>
                  </div>
                  {result.storage && (
                    <div>
                      <strong>Storage:</strong> {result.storage.message}
                      <ul className="ml-4 text-sm">
                        {Object.entries(result.storage.buckets || {}).map(([bucket, count]) => (
                          <li key={bucket}>{bucket}: {count as number} files deleted</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Option 1: Complete Cleanup</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Delete all data from database and MinIO storage
              </p>
              <Button
                variant="destructive"
                onClick={handleCleanup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean All Data
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Option 2: Clear Browser Data Only</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clear localStorage, sessionStorage, and IndexedDB
              </p>
              <Button
                variant="outline"
                onClick={handleClearBrowserData}
                className="w-full"
              >
                Clear Browser Data
              </Button>
            </div>
          </div>

          {result && (
            <div className="border-t pt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}