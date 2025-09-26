'use client'

import { AlertCircle, ArrowRight, Check, Database, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProductDBStore } from '@/store/product-db-store'
import { useProductStore } from '@/store/product-store'

export default function MigratePage() {
  const router = useRouter()
  const oldStore = useProductStore()
  const newStore = useProductDBStore()
  
  const [step, setStep] = useState(1)
  const [migrationStatus, setMigrationStatus] = useState<{
    inProgress: boolean
    completed: boolean
    error: string | null
    results: any
  }>({
    inProgress: false,
    completed: false,
    error: null,
    results: null
  })
  
  const [localProducts, setLocalProducts] = useState<any[]>([])
  
  useEffect(() => {
    // Load products from localStorage
    const stored = localStorage.getItem('product-storage')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setLocalProducts(data.state?.products || [])
      } catch (error) {
        console.error('Failed to parse localStorage data:', error)
      }
    }
  }, [])
  
  const handleMigration = async () => {
    setMigrationStatus({ ...migrationStatus, inProgress: true, error: null })
    setStep(2)
    
    try {
      // Perform migration
      await newStore.migrateFromLocalStorage()
      
      setMigrationStatus({
        inProgress: false,
        completed: true,
        error: null,
        results: {
          success: localProducts.length,
          failed: 0
        }
      })
      setStep(3)
    } catch (error) {
      setMigrationStatus({
        inProgress: false,
        completed: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        results: null
      })
    }
  }
  
  const handleClearLocalStorage = () => {
    localStorage.removeItem('product-storage')
    localStorage.removeItem('capture-storage')
    setLocalProducts([])
    setStep(4)
  }
  
  const handleComplete = () => {
    router.push('/')
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Datenbank-Migration
          </CardTitle>
          <CardDescription>
            Übertrage deine lokalen Daten in die PostgreSQL-Datenbank
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Schritt {step} von 4</span>
              <span>{Math.min(step * 25, 100)}%</span>
            </div>
            <Progress value={Math.min(step * 25, 100)} />
          </div>
          
          {/* Step 1: Overview */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lokale Daten gefunden</AlertTitle>
                <AlertDescription>
                  {localProducts.length} Produkte in localStorage gefunden.
                  Diese werden jetzt in die Datenbank übertragen.
                </AlertDescription>
              </Alert>
              
              {localProducts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Zu migrierende Produkte:</h3>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                    {localProducts.map((product, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{product.name || `Produkt ${index + 1}`}</span>
                        <span className="text-muted-foreground">
                          {product.photos?.length || 0} Fotos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleMigration} 
                className="w-full"
                disabled={localProducts.length === 0}
              >
                Migration starten
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {localProducts.length === 0 && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Keine Daten zu migrieren</AlertTitle>
                  <AlertDescription>
                    Es wurden keine lokalen Daten gefunden. Du kannst direkt mit der Datenbank arbeiten.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Step 2: Migration in progress */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Migration läuft...</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Übertrage Produkte in die Datenbank
                </p>
              </div>
            </div>
          )}
          
          {/* Step 3: Migration complete */}
          {step === 3 && (
            <div className="space-y-4">
              {migrationStatus.completed ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertTitle>Migration erfolgreich!</AlertTitle>
                  <AlertDescription>
                    {migrationStatus.results?.success} Produkte wurden erfolgreich in die Datenbank übertragen.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Migration fehlgeschlagen</AlertTitle>
                  <AlertDescription>
                    {migrationStatus.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <h3 className="font-medium">Nächste Schritte:</h3>
                <p className="text-sm text-muted-foreground">
                  Die lokalen Daten können jetzt gelöscht werden, da alles in der Datenbank gespeichert ist.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleClearLocalStorage}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  LocalStorage leeren
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  Überspringen
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Cleanup complete */}
          {step === 4 && (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Alles erledigt!</AlertTitle>
                <AlertDescription>
                  Die Migration ist abgeschlossen und localStorage wurde geleert. 
                  Alle Daten sind jetzt sicher in der PostgreSQL-Datenbank.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleComplete} className="w-full">
                Zum Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}