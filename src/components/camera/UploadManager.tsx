"use client"

import React, { useEffect, useState } from 'react'
import { UploadQueue, UploadTask } from '@/lib/upload-queue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Upload, RotateCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadManagerProps {
  queue: UploadQueue
  className?: string
}

export function UploadManager({ queue, className }: UploadManagerProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([])

  useEffect(() => {
    const unsubscribe = queue.subscribe(setTasks)
    setTasks(queue.getQueue())
    return unsubscribe
  }, [queue])

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const uploadingCount = tasks.filter(t => t.status === 'uploading').length
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const failedCount = tasks.filter(t => t.status === 'failed').length

  if (tasks.length === 0) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Queue
        </h3>
        <div className="flex gap-2 text-sm">
          {pendingCount > 0 && (
            <span className="text-muted-foreground">{pendingCount} pending</span>
          )}
          {uploadingCount > 0 && (
            <span className="text-blue-500">{uploadingCount} uploading</span>
          )}
          {completedCount > 0 && (
            <span className="text-green-500">{completedCount} complete</span>
          )}
          {failedCount > 0 && (
            <span className="text-destructive">{failedCount} failed</span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
          >
            {/* Thumbnail */}
            <img
              src={task.photo.dataUrl}
              alt={task.photo.fileName}
              className="w-10 h-10 rounded object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {task.photo.fileName}
              </p>
              {task.status === 'uploading' && (
                <Progress value={task.progress} className="h-1 mt-1" />
              )}
              {task.error && (
                <p className="text-xs text-destructive mt-1">{task.error}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1">
              {task.status === 'pending' && (
                <div className="w-4 h-4 rounded-full bg-gray-400 animate-pulse" />
              )}
              {task.status === 'uploading' && (
                <Upload className="w-4 h-4 text-blue-500 animate-pulse" />
              )}
              {task.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {task.status === 'failed' && (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => queue.retry(task.id)}
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => queue.remove(task.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queue.clear()}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}