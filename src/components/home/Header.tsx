"use client"

import { 
  Bell, 
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown
} from 'lucide-react'
import React, { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/dashboard/useAuth'
import { useNotifications } from '@/hooks/dashboard/useNotifications'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
  showSearch?: boolean
  className?: string
}

export function Header({ 
  onMenuToggle,
  showSearch = true,
  className 
}: HeaderProps): JSX.Element {
  const { user } = useAuth()
  const { unreadCount, notifications, markAsRead } = useNotifications()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen] = useState(false)

  const handleNotificationClick = (id: string): void => {
    markAsRead(id)
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side - Menu toggle and logo */}
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold hidden md:block">Dashboard</h1>
              <Badge variant="secondary" className="hidden lg:inline-flex">
                {user?.plan ?? 'Free'}
              </Badge>
            </div>
          </div>

          {/* Center - Search (desktop) */}
          {showSearch && (
            <div className="hidden md:block flex-1 max-w-md">
              <div className={cn(
                "relative transition-all duration-200",
                isSearchFocused && "scale-105"
              )}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, photos..."
                  className="pl-10 pr-4 h-9"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {isSearchFocused && (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span>ESC</span>
                  </kbd>
                )}
              </div>
            </div>
          )}

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            {showSearch && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Help */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden lg:flex"
              aria-label="Help and documentation"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} new</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <p className="text-sm font-medium flex-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
                {notifications.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-sm">
                      View all notifications
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 px-2 gap-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {user?.name ?? 'Guest'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? 'guest@example.com'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden lg:block text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name ?? 'Guest User'}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email ?? 'guest@example.com'}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}