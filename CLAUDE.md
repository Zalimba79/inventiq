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

## Cache Optimization & Performance

### Middleware Configuration
- **Custom Cache Headers**: Comprehensive middleware (`/src/middleware.ts`) removes problematic cache directives
- **Production Optimizations**: 
  - Static assets: `public, max-age=86400, stale-while-revalidate`
  - HTML pages: `public, max-age=0, s-maxage=1, stale-while-revalidate=59`
  - API routes: `private, max-age=0` (no must-revalidate)
  - Next.js static: `public, max-age=31536000, immutable`
- **Cloudflare Compatibility**: Headers designed to work with CDN caching
- **No Deprecated Headers**: Removes `Expires`, `Pragma`, and problematic `must-revalidate` directives

### Image Optimization
- **Selective Optimization**: Individual `<Image>` components use `unoptimized` prop where needed
- **Logo Handling**: Plain `<img>` tag for logo to avoid hydration issues
- **MinIO Direct Access**: Images served directly from S3-compatible storage

### Browser Compatibility
- **Firefox Notes**: 
  - `fetchpriority` attribute not supported (safely ignored)
  - `theme-color` works on mobile only
  - `text-size-adjust` uses vendor prefixes
- **Accessibility**: Viewport allows zooming (no `maximum-scale` restriction)

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
Status (Last Updated: 2025-09-29)
- **ESLint Errors**: ~200+ errors (mostly from DB migration type issues)
- **TypeScript Files**: 103+ files
- **Components**: 60+ React components
- **Pages**: 10 Next.js pages
- **Dependencies**: 33 runtime, 31 dev
- **Git Branch**: develop
- **Recent Fixes**: Cache headers, browser compatibility, image hydration
- **Last Major Update**: Comprehensive middleware for cache control


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
- `ActivityFeed`: Recent activity timeline
- `DashboardLayout`: Component
- `Header`: Top navigation with user menu and notifications
- `HomePage`: Main dashboard orchestration component
- `QuickActions`: Quick access buttons
- `RecentCaptures`: Recent photo thumbnails
- `StatsCard`: Dashboard statistics display
- `StatsOverview`: Component
- `StorageWidget`: Component
- `TipsWidget`: Component

### Camera Components


### Product Components
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Component
- `ImageLightbox`: Component
- `ProductCard`: Component
- `ProductGallery`: Display products with filtering
- `ProductGalleryLightbox`: Component
- `ProductValidation`: Review and validate AI results
- `ValidationHistory`: Component

### UI Components
- `alert`: shadcn/ui component
- `avatar`: shadcn/ui component
- `badge`: shadcn/ui component
- `button`: shadcn/ui component
- `card`: shadcn/ui component
- `checkbox`: shadcn/ui component
- `dialog`: shadcn/ui component
- `dropdown-menu`: shadcn/ui component
- `input`: shadcn/ui component
- `label`: shadcn/ui component
- ... and 8 more UI components


### Dashboard Components
- `ActivityFeed`: Recent activity timeline
- `DashboardLayout`: Component
- `Header`: Top navigation with user menu and notifications
- `HomePage`: Main dashboard orchestration component
- `QuickActions`: Quick access buttons
- `RecentCaptures`: Recent photo thumbnails
- `StatsCard`: Dashboard statistics display
- `StatsOverview`: Component
- `StorageWidget`: Component
- `TipsWidget`: Component

### Camera Components


### Product Components
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Component
- `ImageLightbox`: Component
- `ProductCard`: Component
- `ProductGallery`: Display products with filtering
- `ProductGalleryLightbox`: Component
- `ProductValidation`: Review and validate AI results
- `ValidationHistory`: Component

### UI Components
- `alert`: shadcn/ui component
- `avatar`: shadcn/ui component
- `badge`: shadcn/ui component
- `button`: shadcn/ui component
- `card`: shadcn/ui component
- `checkbox`: shadcn/ui component
- `dialog`: shadcn/ui component
- `dropdown-menu`: shadcn/ui component
- `input`: shadcn/ui component
- `label`: shadcn/ui component
- ... and 8 more UI components


### Dashboard Components
- `ActivityFeed`: Recent activity timeline
- `DashboardLayout`: Component
- `Header`: Top navigation with user menu and notifications
- `HomePage`: Main dashboard orchestration component
- `QuickActions`: Quick access buttons
- `RecentCaptures`: Recent photo thumbnails
- `StatsCard`: Dashboard statistics display
- `StatsOverview`: Component
- `StorageWidget`: Component
- `TipsWidget`: Component

### Camera Components


### Product Components
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Component
- `ImageLightbox`: Component
- `ProductCard`: Component
- `ProductGallery`: Display products with filtering
- `ProductGalleryLightbox`: Component
- `ProductValidation`: Review and validate AI results
- `ValidationHistory`: Component

### UI Components
- `alert`: shadcn/ui component
- `avatar`: shadcn/ui component
- `badge`: shadcn/ui component
- `button`: shadcn/ui component
- `card`: shadcn/ui component
- `checkbox`: shadcn/ui component
- `dialog`: shadcn/ui component
- `dropdown-menu`: shadcn/ui component
- `input`: shadcn/ui component
- `label`: shadcn/ui component
- ... and 8 more UI components


### Dashboard Components
- `ActivityFeed`: Recent activity timeline
- `DashboardLayout`: Component
- `Header`: Top navigation with user menu and notifications
- `HomePage`: Main dashboard orchestration component
- `QuickActions`: Quick access buttons
- `RecentCaptures`: Recent photo thumbnails
- `StatsCard`: Dashboard statistics display
- `StatsOverview`: Component
- `StorageWidget`: Component
- `TipsWidget`: Component

### Camera Components


### Product Components
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Component
- `ImageLightbox`: Component
- `ProductCard`: Component
- `ProductGallery`: Display products with filtering
- `ProductGalleryLightbox`: Component
- `ProductValidation`: Review and validate AI results
- `ValidationHistory`: Component

### UI Components
- `alert`: shadcn/ui component
- `avatar`: shadcn/ui component
- `badge`: shadcn/ui component
- `button`: shadcn/ui component
- `card`: shadcn/ui component
- `checkbox`: shadcn/ui component
- `dialog`: shadcn/ui component
- `dropdown-menu`: shadcn/ui component
- `input`: shadcn/ui component
- `label`: shadcn/ui component
- ... and 8 more UI components


### Dashboard Components
- `ActivityFeed`: Recent activity timeline
- `DashboardLayout`: Component
- `Header`: Top navigation with user menu and notifications
- `HomePage`: Main dashboard orchestration component
- `QuickActions`: Quick access buttons
- `RecentCaptures`: Recent photo thumbnails
- `StatsCard`: Dashboard statistics display
- `StatsOverview`: Component
- `StorageWidget`: Component
- `TipsWidget`: Component

### Camera Components


### Product Components
- `BulkProductValidation`: Validate multiple products
- `DraftProductCard`: Component
- `ImageLightbox`: Component
- `ProductCard`: Component
- `ProductGallery`: Display products with filtering
- `ProductGalleryLightbox`: Component
- `ProductValidation`: Review and validate AI results
- `ValidationHistory`: Component

### UI Components
- `alert`: shadcn/ui component
- `avatar`: shadcn/ui component
- `badge`: shadcn/ui component
- `button`: shadcn/ui component
- `card`: shadcn/ui component
- `checkbox`: shadcn/ui component
- `dialog`: shadcn/ui component
- `dropdown-menu`: shadcn/ui component
- `input`: shadcn/ui component
- `label`: shadcn/ui component
- ... and 8 more UI components


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

## Deployment Guide

### Production Deployment
- **Current Production**: inventoscan.mindbit.net
- **CDN**: Cloudflare (may require Transform Rules for cache headers)
- **Deployment Documentation**: See `/DEPLOYMENT.md` for detailed cache fix deployment

### Pre-Deployment Checklist
```bash
# 1. Run production build locally
npm run build

# 2. Test production build
npm run start

# 3. Verify no console warnings
# Check browser DevTools for cache-control warnings

# 4. Commit all changes
git add -A
git commit -m "fix: cache headers and browser compatibility"

# 5. Push to repository
git push origin develop
```

### Post-Deployment Verification
1. Clear Cloudflare cache if applicable
2. Check Network tab in DevTools for proper cache headers
3. Verify no `must-revalidate` or `no-store` directives
4. Monitor performance metrics

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

# Database (PostgreSQL in Docker)
DATABASE_URL=postgresql://inventiq:inventiq2025@localhost:5432/inventiq

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

## Recent Major Updates (2025-09-26)

### 🗄️ PostgreSQL Database Integration
- **Full CRUD API**: Complete REST API for all product operations
- **Prisma ORM**: Type-safe database queries with migrations
- **Migration Tool**: User-friendly `/migrate` page to transfer localStorage data
- **New Store**: `product-db-store.ts` for database operations

### 🐳 Docker Containerization
- **Multi-stage Build**: Optimized production Docker image
- **Development Setup**: `docker-compose.dev.yml` for local PostgreSQL
- **Production Ready**: Full `docker-compose.yml` with all services
- **Health Monitoring**: `/api/health` endpoint for container status

### 🖼️ Enhanced Image Gallery
- **ProductGalleryLightbox**: Multi-image viewer with thumbnails
- **Keyboard Navigation**: Arrow keys, zoom (+/-), rotate (R)
- **Image Resolution**: Display of dimensions and metadata
- **Smooth Transitions**: Professional image switching animations

## Important Notes

- **Database Storage**: PostgreSQL for all product data (localStorage deprecated)
- **Image Storage**: MinIO S3-compatible storage on Synology NAS
- **Container Requirements**: Docker needed for PostgreSQL
- **AI Analysis**: Requires OpenAI API key for GPT-4 Vision
- **Responsive Design**: Optimized for both mobile and desktop
- **Real-time Updates**: Hot reload without page refresh
- **Auto-cleanup**: Images deleted from MinIO when products deleted
- **Professional Capture**: Studio interface with guides and batch capture
- **Cache Optimization**: Custom middleware eliminates browser warnings
- **Production Ready**: All cache-control issues resolved locally
- **Browser Support**: Full compatibility with Chrome, Edge, Firefox, Safari
- **⚠️ Mixed Content**: Production HTTPS requires MinIO HTTPS proxy or API proxy route


<!-- AUTO-GENERATED STATS - DO NOT EDIT MANUALLY -->
<!-- Last Updated: 2025-09-29 -->
<!-- Branch: develop -->
<!-- Cache: Custom middleware for production optimization -->
<!-- ESLint: 200+ errors (type safety issues from DB migration) -->
<!-- Components: 60+ files -->
<!-- Database: PostgreSQL with Prisma ORM -->
<!-- Storage: MinIO S3-compatible on Synology NAS -->
<!-- Production: inventoscan.mindbit.net (awaiting deployment) -->
