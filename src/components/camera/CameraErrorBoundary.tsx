"use client"

import { AlertTriangle, RefreshCw, Camera } from 'lucide-react'
import React, { Component, type ReactNode, type ErrorInfo } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CameraErrorBoundaryState {
  hasError: boolean
  errorMessage: string
  errorStack?: string
  retryCount: number
}

interface CameraErrorBoundaryProps {
  children: ReactNode
  fallbackComponent?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Error boundary specifically for camera components
 * Provides graceful fallbacks and recovery options
 */
export class CameraErrorBoundary extends Component<CameraErrorBoundaryProps, CameraErrorBoundaryState> {
  private maxRetries = 3

  constructor(props: CameraErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
      errorStack: undefined,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<CameraErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error.message || 'Camera component error'
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('CameraErrorBoundary caught error:', error)
    console.error('Error info:', errorInfo)
    
    this.setState({
      errorStack: error.stack
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        errorMessage: '',
        errorStack: undefined,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      errorMessage: '',
      errorStack: undefined,
      retryCount: 0
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent
      }

      // Default error UI
      return (
        <div className="h-full flex items-center justify-center p-4 bg-gray-50">
          <Card className="p-6 max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Camera Error</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.errorMessage}
            </p>
            
            <Alert className="mb-4">
              <Camera className="h-4 w-4" />
              <AlertDescription>
                The camera interface encountered an issue. This could be due to:
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Browser permissions not granted</li>
                  <li>Camera already in use by another app</li>
                  <li>Hardware compatibility issues</li>
                  <li>Network connectivity problems</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <Button onClick={this.handleRetry} variant="default" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button onClick={this.handleReset} variant="outline" size="sm">
                Reset
              </Button>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.errorStack && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-muted-foreground mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.errorStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}