"use client"

import { Plus, Minus, Hash } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({ 
  quantity, 
  onChange,
  min = 1,
  max = 9999
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    onChange(Math.max(min, quantity - 1))
  }

  const handleIncrease = () => {
    onChange(Math.min(max, quantity + 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min
    onChange(Math.max(min, Math.min(max, value)))
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="quantity-input" className="text-sm font-medium flex items-center gap-1">
        <Hash className="w-3 h-3" />
        <span>Qty:</span>
      </label>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 min-w-[28px] min-h-[28px]"
          onClick={handleDecrease}
          disabled={quantity <= min}
          aria-label="Decrease quantity"
          title="Decrease quantity"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input
          id="quantity-input"
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="h-7 w-12 text-center px-1"
          min={min}
          max={max}
          aria-label="Product quantity"
          aria-describedby="quantity-help"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 min-w-[28px] min-h-[28px]"
          onClick={handleIncrease}
          disabled={quantity >= max}
          aria-label="Increase quantity"
          title="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </Button>
        <span id="quantity-help" className="sr-only">
          Enter the quantity of this product (between {min} and {max})
        </span>
      </div>
    </div>
  )
}