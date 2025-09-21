# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Inventiq - AI-Powered Inventory Management

## Project Overview
Inventiq is an AI-powered inventory management system that helps users catalog and organize products through photo capture and intelligent analysis. The application uses computer vision to identify products, estimate values, and maintain a structured inventory database.

## Key Features

### Core Workflow
1. **Direct Photo Capture**: Take photos of products using webcam
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
- **Camera**: react-webcam for photo capture
- **Icons**: Lucide React

### Backend/API
- **API Routes**: Next.js API routes
- **AI Integration**: OpenAI GPT-4 Vision API
- **Image Processing**: Base64 data URLs
- **Database**: Prisma ORM (schema ready, not connected)

## Project Structure
```
inventiq/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API endpoints
│   │   │   └── ai/            # AI analysis endpoints
│   │   ├── capture/           # Photo capture page
│   │   ├── products/          # Product management pages
│   │   │   ├── [id]/         # Product detail/edit page
│   │   │   ├── draft/        # Draft products gallery
│   │   │   ├── validation/   # Products ready for validation
│   │   │   └── confirmed/    # Confirmed products gallery
│   │   └── page.tsx          # Dashboard/home page
│   ├── components/
│   │   ├── camera/           # Camera capture components
│   │   ├── products/         # Product management components
│   │   ├── layout/          # Navigation components
│   │   ├── ui/              # shadcn/ui components
│   │   └── debug/           # Debug utilities
│   ├── store/               # Zustand stores
│   │   ├── product-store.ts # Product state management
│   │   └── capture-store.ts # Capture session management
│   ├── types/              # TypeScript definitions
│   └── lib/               # Utilities and helpers
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
npm run lint:fix   # Fix linting issues
npm run typecheck  # TypeScript type checking
```

## Key Components

### Camera Components
- `DirectPhotoCapture`: Main capture interface with quantity
- `CameraView`: WebRTC camera integration
- `PhotoPreview`: Display captured photos

### Product Components
- `ProductGallery`: Display products with filtering
- `ProductValidation`: Review and validate AI results
- `BulkProductValidation`: Validate multiple products

### Navigation
- `Navigation`: Top navigation bar
- `MobileNavigation`: Bottom navigation for mobile

## Workflow Pages

### 1. Dashboard (`/`)
- Overview statistics
- Quick actions
- Workflow progress visualization
- Clear storage option

### 2. Capture (`/capture`)
- Direct photo capture
- Quantity setting
- Create products immediately
- No intermediate organize step

### 3. Draft Products (`/products/draft`)
- View all draft products
- Click to edit details
- Select for AI analysis
- Delete products
- Add more photos

### 4. Product Detail (`/products/[id]`)
- Edit product name and quantity
- Manage photos (set primary, delete)
- Add more photos to product
- Save and return to draft

### 5. Validation (`/products/validation`)
- Review AI-analyzed products
- Edit details before confirming
- Bulk validation option

### 6. Confirmed (`/products/confirmed`)
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

### LocalStorage Keys
- `product-storage`: Product data and state
- `capture-storage`: Current capture session

### Storage Optimization
- Images stored at 800x600, 70% JPEG quality
- Automatic compression on capture
- Clear storage button on dashboard

## Known Issues & Solutions

### Quota Exceeded Error
- **Cause**: LocalStorage full from image data
- **Solution**: Use "Clear All Data" button on dashboard

### Camera Permission
- **Required**: Browser camera access permission
- **Fallback**: Error message with retry option

## Future Enhancements

### Planned Features
1. Connect PostgreSQL database
2. Cloud image storage (S3/Cloudinary)
3. User authentication
4. Export/import functionality
5. Barcode scanning
6. Multi-language support
7. Mobile app version

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

- All data currently stored in browser localStorage
- Images are base64 encoded (uses significant storage)
- AI analysis requires OpenAI API key
- Responsive design for mobile and desktop
- Real-time updates without page refresh