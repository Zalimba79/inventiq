"use client"

import { Menu } from 'lucide-react'
import React, { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
  showHeader?: boolean
  showSidebar?: boolean
  sidebarContent?: ReactNode
}

export function DashboardLayout({
  children,
  className,
  showHeader = true,
  showSidebar = false,
  sidebarContent
}: DashboardLayoutProps): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = (): void => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {showHeader && (
        <Header 
          onMenuToggle={showSidebar ? toggleSidebar : undefined}
        />
      )}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSidebarOpen(false)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Close sidebar"
              />
            )}

            {/* Sidebar Content */}
            <aside className={cn(
              "fixed lg:relative z-40 h-full w-64 border-r bg-card",
              "transform transition-transform duration-300 lg:transform-none",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
              <div className="flex h-full flex-col">
                {/* Sidebar Header - Mobile Only */}
                <div className="flex items-center justify-between p-4 border-b lg:hidden">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {sidebarContent ?? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Sidebar content goes here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto",
          className
        )}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}