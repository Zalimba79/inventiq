"use client"

import { LightGalleryProvider } from '@/components/lightgallery'
import DraftProductsContent from './DraftProductsContent'

export default function DraftProductsPage(): JSX.Element {
  return (
    <LightGalleryProvider>
      <DraftProductsContent />
    </LightGalleryProvider>
  )
}