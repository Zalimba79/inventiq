# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Inventiq - AI-Powered Inventory Management

## GitHub Repository
- **Owner**: Zalimba79
- **Repository**: inventiq
- **URL**: https://github.com/Zalimba79/inventiq

## Project Overview
Inventiq is an AI-powered inventory management system that helps users catalog and organize products through photo capture and intelligent analysis. The application uses computer vision to identify products, estimate values, and maintain a structured inventory database.

## Key Features

### Core Workflow
1. **Direct Photo Capture**: Take photos of products using webcam, mobilephone, Upload of Picture to a Product
2. **Quantity Management**: Track quantity for each product
3. **Product Organization**: Create draft products with photos
4. **AI Analysis**: Automatic product identification using GPT-4 Vision
5. **Validation Process**: Review and edit AI-identified products
6. **Confirmed Inventory**: Final catalog of validated products

### Current Implementation
- **Multi-page Architecture**: Separate views for each workflow stage
- **Direct Product Creation**: Photos go directly into products (no organize step)
- **Photo Management**: Edit, reorder, and delete product photos
- **Quantity Tracking**: Set quantity during capture or edit later
- **Status Workflow**: DRAFT → ANALYZED → VALIDATED → CONFIRMED
- **Persistent Storage**: Zustand with localStorage persistence

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Camera**: Studio capture interface with multi-resolution support
- **Icons**: Lucide React

### Backend/API
- **API Routes**: Next.js API routes
- **AI Integration**: OpenAI GPT-4 Vision API
- **Image Processing**: Sharp for optimization, Base64 for local storage
- **Database**: Prisma ORM (schema ready, not connected)
- **Object Storage**: MinIO S3-compatible storage (Synology NAS) - FULLY INTEGRATED

## Project Structure
```
inventiq/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API endpoints
│   │   │   ├── ai/            # AI analysis endpoints
│   │   │   ├── upload/        # MinIO upload endpoints
│   │   │   └── storage/       # Storage management
│   │   ├── capture/           # Photo capture pages
│   │   │   ├── studio/        # Professional studio interface
│   │   │   └── quick/         # Quick mobile capture
│   │   ├── products/          # Product management pages
│   │   │   ├── [id]/         # Product detail/edit page
│   │   │   ├── draft/        # Draft products gallery
│   │   │   ├── validation/   # Products ready for validation
│   │   │   └── confirmed/    # Confirmed products gallery
│   │   └── page.tsx          # Dashboard/home page
│   ├── components/
│   │   ├── studio/           # Studio capture components
│   │   ├── capture/         # Capture UI components
│   │   ├── products/        # Product management components
│   │   ├── layout/          # Navigation components
│   │   ├── ui/              # shadcn/ui components
│   │   └── debug/           # Debug utilities
│   ├── store/               # Zustand stores
│   │   └── product-store.ts # Product state with MinIO integration
│   ├── hooks/               # Custom hooks
│   │   └── useMinioUpload.ts # MinIO upload hook
│   ├── lib/                # Utilities and helpers
│   │   └── storage/         # MinIO client and config
│   └── types/              # TypeScript definitions
├── scripts/                # Utility scripts
│   ├── list-minio-files.js # List MinIO contents
│   └── setup-minio-buckets.js # Setup MinIO buckets
├── prisma/
│   └── schema.prisma      # Database schema (ready to use)
└── public/                # Static assets
```

## Current Store Schema

### Product Store (Zustand)
```typescript
interface Product {
  id: string
  createdAt: Date
  updatedAt: Date
  status: ProductStatus // DRAFT, ANALYZED, VALIDATED, CONFIRMED
  quantity: number
  
  // AI Analysis Results
  name?: string
  brand?: string
  model?: string
  category?: string
  subcategory?: string
  description?: string
  features?: string[]
  condition?: string
  confidence?: number
  
  // Value estimation
  estimatedMin?: number
  estimatedMax?: number
  currency: string
  
  // Associated data
  photos: ProductPhoto[]
  tags: string[]
}
```

## Development Commands

### Start Development
```bash
npm run dev        # Start development server on port 3000
```

### Build & Production
```bash
npm run build      # Build for production
npm run start      # Start production server
```

### Code Quality
```bash
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

### ESLint Configuration
- **Strict TypeScript rules** for type safety
- **Security rules** for web application safety
- **Accessibility standards** (WCAG compliance)  
- **Import organization** with automatic sorting
- **React/Next.js best practices**
- **Code complexity limits** (max 20 cyclomatic, max 15 cognitive)
- **Function length limits** (max 200 lines per function)



## Key Components

### Dashboard Components
- `HomePage`: Main dashboard orchestration component
- `Header`: Top navigation with user menu and notifications
- `StatsOverview`: Enhanced statistics display with progress bars
- `QuickActions`: Animated quick access cards with real-time stats
- `RecentCaptures`: Recent photo thumbnails grid
- `ActivityFeed`: Recent activity timeline
- `StorageWidget`: Storage monitoring with visual warnings
- `TipsWidget`: Auto-rotating tips carousel
- `DashboardLayout`: Wrapper component with sidebar support

### Capture Components
- `SmartCaptureRouter`: Smart routing for different capture methods (dropzone/camera)
- `SimpleCameraCapture`: Minimal camera capture interface

### Product Components
- `ProductGallery`: Display products with filtering
- `ProductValidation`: Review and validate AI results
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Product card with automatic photo loading
- `ImageLightbox`: Full-screen image viewer

### Navigation
- `Navigation`: Top navigation bar with Inventiq logo and main menu
- `MobileNavigation`: Bottom navigation for mobile with icon-based UI

## Workflow Pages

### 1. Dashboard (`/`)
- Overview statistics
- Quick actions
- Workflow progress visualization
- Storage monitoring

### 2. Capture Hub (`/capture`)
- Three capture options:
  - **Studio Capture**: Professional multi-angle capture
  - **Quick Capture**: Fast mobile-optimized capture
  - **File Upload**: Import existing photos

### 3. Studio Capture (`/capture/studio`)
- Professional capture interface
- Camera selection and resolution control
- Live preview with guides
- Automatic MinIO upload
- Batch capture and save

### 4. Quick Capture (`/capture/quick`)
- Mobile-optimized interface
- Native camera integration
- Fast single-photo capture
- Direct product creation

### 5. Draft Products (`/products/draft`)
- View all draft products
- Click to edit details
- Select for AI analysis
- Delete products (with MinIO cleanup)
- Add more photos

### 6. Product Detail (`/products/[id]`)
- Edit product name and quantity
- Manage photos (set primary, delete)
- Add more photos to product
- Save and return to draft

### 7. Validation (`/products/validation`)
- Review AI-analyzed products
- Edit details before confirming
- Bulk validation option

### 8. Confirmed (`/products/confirmed`)
- Final inventory catalog
- Search and filter
- Export to CSV
- View statistics

## AI Integration

### Product Analysis Endpoint
```typescript
POST /api/ai/analyze
Body: {
  images: string[]  // Base64 data URLs
  sessionId: string
}

Response: {
  success: boolean
  analysis: {
    name: string
    brand?: string
    category?: string
    features?: string[]
    condition?: string
    estimatedValue?: { min: number, max: number }
    confidence: number
  }
}
```

## Storage Management

### Storage Architecture (IMPLEMENTED)
- **MinIO S3**: Primary image storage on Synology NAS
  - Main images: `inventiq-assets/products/`
  - Thumbnails: `inventiq-assets/thumbnails/`
  - Automatic thumbnail generation (300x300)
  - Automatic cleanup on product deletion
- **IndexedDB**: Fallback for large local images (>500KB)
- **LocalStorage**: Product metadata and small images

### MinIO Integration
- **Upload**: Automatic during studio capture
- **URLs**: Direct access via `http://10.2.200.102:9000`
- **Deletion**: Cascade delete (main image + thumbnail)
- **Optimization**: Sharp library for image processing

### Storage Flow
1. **Capture**: Image captured in Studio/Quick mode
2. **Upload**: Automatically uploaded to MinIO
3. **Storage**: URL saved in product, dataUrl kept for preview
4. **Access**: Direct URL access for display
5. **Deletion**: Automatic cleanup of both main and thumbnail

## Known Issues & Solutions

### Quota Exceeded Error
- **Cause**: LocalStorage full from image data
- **Solution**: Use "Clear All Data" button on dashboard

### Camera Permission
- **Required**: Browser camera access permission
- **Fallback**: Error message with retry option


## Recent Updates

### ✅ Completed Features
- **MinIO S3 Storage**: Fully integrated with automatic upload/delete
- **Studio Capture Interface**: Professional multi-angle capture
- **Smart Image Deletion**: Automatic thumbnail cleanup
- **Hybrid Storage**: MinIO for cloud, IndexedDB for large local files

### 🚀 Future Enhancements
1. Connect PostgreSQL database
2. User authentication (NextAuth.js)
3. Export/import functionality
4. Barcode/QR code scanning
5. Multi-language support
6. Mobile app version (React Native)
7. Bulk import from Excel/CSV

### Database Migration
```bash
npx prisma migrate dev   # Run migrations
npx prisma studio       # Open database GUI
```

## Development Tips

### Adding New Features
1. Check existing patterns in codebase
2. Use TypeScript for type safety
3. Follow existing component structure
4. Update CLAUDE.md with changes

### Testing Workflow
1. Clear storage if needed
2. Capture test photos
3. Set quantity
4. Create products
5. Run AI analysis
6. Validate results
7. Check confirmed inventory

### Performance Optimization
- Reduce image sizes before storage
- Use lazy loading for galleries
- Implement virtual scrolling for large lists
- Cache AI results

## Environment Variables

Create `.env.local`:
```env
# OpenAI API
OPENAI_API_KEY=your_api_key_here

# MinIO Storage (S3-compatible)
S3_ENDPOINT=http://10.2.200.102:9000
S3_BUCKET=inventiq
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_PUBLIC_URL=http://10.2.200.102:9000

# Database (when ready)
DATABASE_URL=postgresql://user:password@localhost:5432/inventiq

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Reference

### Common Tasks
- **Add photos to product**: Click camera icon in draft products
- **Set primary photo**: Click "Set Main" in product detail
- **Delete photo**: Hover and click trash icon
- **Change quantity**: Use +/- buttons in capture or edit
- **Clear all data**: Dashboard → "Clear All Data" button

### Navigation Flow
```
Dashboard → Capture → Draft → (AI Analysis) → Validation → Confirmed
           ↓
    Product Detail (Edit)
```

### Status Flow
```
DRAFT → QUEUED → ANALYZING → ANALYZED → VALIDATED → CONFIRMED
```

## Important Notes

- **Hybrid Storage**: MinIO for cloud storage, localStorage/IndexedDB for offline
- **Image Storage**: Automatically uploaded to MinIO with thumbnails
- **AI Analysis**: Requires OpenAI API key for GPT-4 Vision
- **Responsive Design**: Optimized for both mobile and desktop
- **Real-time Updates**: Hot reload without page refresh
- **Auto-cleanup**: Images deleted from MinIO when products deleted
- **Professional Capture**: Studio interface with guides and batch capture
