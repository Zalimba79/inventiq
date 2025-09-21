"use client"

import React, { useState } from 'react'
import { ProductAnalysis, ConfidenceScore } from '@/types/ai'
import { getConfidenceLevel, getImprovementSuggestions } from '@/lib/ai/confidence-scorer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Save, 
  X,
  Tag,
  DollarSign,
  Package,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductAnalysisCardProps {
  analysis: ProductAnalysis
  confidenceScores: ConfidenceScore
  onValidate?: (validated: ProductAnalysis) => void
  onReject?: () => void
  className?: string
}

export function ProductAnalysisCard({
  analysis,
  confidenceScores,
  onValidate,
  onReject,
  className
}: ProductAnalysisCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAnalysis, setEditedAnalysis] = useState(analysis)
  
  const confidenceLevel = getConfidenceLevel(analysis.confidence)
  const suggestions = getImprovementSuggestions(confidenceScores)

  const handleSave = () => {
    onValidate?.(editedAnalysis)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedAnalysis(analysis)
    setIsEditing(false)
  }

  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      {/* Header with confidence */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isEditing ? (
              <input
                type="text"
                value={editedAnalysis.name}
                onChange={(e) => setEditedAnalysis({ ...editedAnalysis, name: e.target.value })}
                className="flex-1 px-2 py-1 border rounded"
              />
            ) : (
              analysis.name
            )}
          </h3>
          {analysis.brand && (
            <p className="text-sm text-muted-foreground">
              Brand: {isEditing ? (
                <input
                  type="text"
                  value={editedAnalysis.brand || ''}
                  onChange={(e) => setEditedAnalysis({ ...editedAnalysis, brand: e.target.value })}
                  className="px-2 py-1 border rounded ml-1"
                />
              ) : (
                <span className="font-medium">{analysis.brand}</span>
              )}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confidence Score Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI Confidence</span>
          <span className={cn("text-sm font-semibold", confidenceLevel.color)}>
            {Math.round(analysis.confidence * 100)}%
          </span>
        </div>
        <Progress value={analysis.confidence * 100} className="h-2" />
        <div className="flex items-center gap-2">
          {analysis.confidence >= 0.8 ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : analysis.confidence >= 0.6 ? (
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span className={cn("text-sm", confidenceLevel.color)}>
            {confidenceLevel.label}
          </span>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name:</span>
          <span className="font-medium">{Math.round(confidenceScores.name * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Category:</span>
          <span className="font-medium">{Math.round(confidenceScores.category * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Brand:</span>
          <span className="font-medium">{Math.round(confidenceScores.brand * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Features:</span>
          <span className="font-medium">{Math.round(confidenceScores.features * 100)}%</span>
        </div>
      </div>

      {/* Category and Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {isEditing ? (
              <input
                type="text"
                value={editedAnalysis.category}
                onChange={(e) => setEditedAnalysis({ ...editedAnalysis, category: e.target.value })}
                className="px-2 py-1 border rounded"
                placeholder="Category"
              />
            ) : (
              <>
                {analysis.category}
                {analysis.subcategory && ` > ${analysis.subcategory}`}
              </>
            )}
          </span>
        </div>
        
        {isEditing ? (
          <textarea
            value={editedAnalysis.description}
            onChange={(e) => setEditedAnalysis({ ...editedAnalysis, description: e.target.value })}
            className="w-full px-2 py-1 border rounded text-sm"
            rows={3}
            placeholder="Description"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {analysis.description}
          </p>
        )}
      </div>

      {/* Features */}
      {analysis.features && analysis.features.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Key Features</span>
          </div>
          <ul className="text-sm space-y-1">
            {analysis.features.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-muted-foreground">•</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...editedAnalysis.features]
                      newFeatures[index] = e.target.value
                      setEditedAnalysis({ ...editedAnalysis, features: newFeatures })
                    }}
                    className="flex-1 px-2 py-0.5 border rounded text-sm"
                  />
                ) : (
                  <span>{feature}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estimated Value */}
      {analysis.estimatedValue && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            Estimated Value: 
            <span className="font-semibold ml-1">
              ${analysis.estimatedValue.min} - ${analysis.estimatedValue.max}
            </span>
          </span>
        </div>
      )}

      {/* Condition */}
      {analysis.condition && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Condition:</span>
          <span className={cn(
            "text-sm font-medium capitalize",
            analysis.condition === 'new' && "text-green-600",
            analysis.condition === 'like-new' && "text-blue-600",
            analysis.condition === 'good' && "text-yellow-600",
            analysis.condition === 'fair' && "text-orange-600",
            analysis.condition === 'poor' && "text-red-600"
          )}>
            {analysis.condition.replace('-', ' ')}
          </span>
        </div>
      )}

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && analysis.confidence < 0.8 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">Improve Accuracy</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-1">
                <span>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1"
          onClick={() => onValidate?.(editedAnalysis)}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Validate Product
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onReject}
        >
          <X className="w-4 h-4 mr-2" />
          Reject & Retry
        </Button>
      </div>
    </div>
  )
}