# Inventiq - AI-Powered Inventory Management

## Project Overview
For contributor guidelines see [AGENTS.md](AGENTS.md).
Inventiq is a web application for intelligent product inventory management through multi-angle photography and AI-powered product identification.

## Core Features
1. **Multi-Photo Capture**: Users can take multiple photos per product
2. **AI Product Identification**: Automatic product recognition using vision AI
3. **Draft & Validation**: Review and edit AI-identified products
4. **Catalog Management**: Organize validated products
5. **Product Image Generation**: Create sales-ready product images from raw photos

## Technology Stack

### Frontend
- **Framework**: React/Next.js 14+ with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui
- **Camera Integration**: WebRTC API / react-webcam
- **State Management**: Zustand or Redux Toolkit
- **Image Preview**: react-image-gallery
- **Forms**: React Hook Form + Zod validation

### Backend
- **API Framework**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Image Storage**: AWS S3 or Cloudinary
- **Queue System**: Bull/BullMQ for image processing
- **Authentication**: NextAuth.js or Auth0

### AI/ML Services
- **Product Recognition**: 
  - Google Vision API for object detection
  - OpenAI GPT-4 Vision for product details
  - Custom trained model (TensorFlow.js/PyTorch)
- **Image Processing**:
  - Sharp for image optimization
  - Remove.bg API for background removal
  - Cloudinary AI transformations

## Project Structure
```
inventiq/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/                # API endpoints
│   │   ├── capture/            # Photo capture flow
│   │   ├── review/             # Product review/edit
│   │   ├── catalog/            # Product catalog
│   │   └── products/           # Product management
│   ├── components/
│   │   ├── camera/             # Camera components
│   │   ├── product/            # Product cards/forms
│   │   ├── catalog/            # Catalog views
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── ai/                 # AI service integrations
│   │   ├── image-processing/   # Image manipulation
│   │   ├── db/                 # Database queries
│   │   └── utils/              # Helper functions
│   └── types/                  # TypeScript definitions
├── prisma/
│   └── schema.prisma            # Database schema
├── public/
│   └── images/                  # Static assets
└── tests/                       # Test files
```

## Database Schema
```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  description   String?
  category      String?
  brand         String?
  model         String?
  status        Status   @default(DRAFT)
  aiConfidence  Float?   // AI identification confidence
  images        Image[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Image {
  id           String    @id @default(cuid())
  productId    String
  product      Product   @relation(fields: [productId])
  url          String
  type         ImageType // RAW, PROCESSED, SALES
  metadata     Json?     // EXIF, dimensions, etc.
  aiAnalysis   Json?     // AI detection results
  createdAt    DateTime  @default(now())
}

enum Status {
  DRAFT
  VALIDATED
  PUBLISHED
}

enum ImageType {
  RAW          // Original capture
  PROCESSED    // Background removed
  SALES        // Final product image
}
```

## Development Workflow

### 1. Photo Capture Flow
```typescript
// Components needed:
- CameraView: WebRTC camera access
- PhotoCapture: Multi-photo session management
- PhotoPreview: Review captured images
- PhotoUpload: Batch upload to storage
```

### 2. AI Product Identification
```typescript
// Services to implement:
- analyzeProductImage(imageUrl): Extract product info
- searchProductDatabase(features): Find matching products
- generateProductMetadata(images[]): Create product details
- calculateConfidenceScore(results): Assess AI accuracy
```

### 3. Product Validation UI
```typescript
// Features:
- Side-by-side comparison (AI vs Manual)
- Inline editing with auto-save
- Bulk operations for multiple products
- Confidence indicators
```

### 4. Image Processing Pipeline
```typescript
// Pipeline steps:
1. Upload raw image to storage
2. Queue background removal job
3. Generate multiple sizes/formats
4. Apply AI enhancements
5. Create sales-ready versions
```

## Key Commands for Development

### Feature Implementation
- `/sc:implement camera-capture` - Build camera integration
- `/sc:implement ai-recognition` - Add AI product detection
- `/sc:implement product-validation` - Create review interface
- `/sc:implement image-pipeline` - Setup processing queue

### Testing
- `/sc:test camera-flow` - Test capture workflow
- `/sc:test ai-accuracy` - Validate AI predictions
- `/sc:test image-processing` - Check pipeline

### Optimization
- `/sc:improve performance` - Optimize image loading
- `/sc:analyze bundle-size` - Check client bundle
- `/sc:optimize database` - Improve query performance

## AI Integration Guidelines

### Vision AI Setup
1. **Google Cloud Vision**:
   - Enable Vision API
   - Setup service account
   - Configure object detection & OCR

2. **OpenAI GPT-4 Vision**:
   - Product description generation
   - Category classification
   - Feature extraction

3. **Custom Model** (Optional):
   - Train on specific product categories
   - Deploy with TensorFlow.js
   - Continuous learning from validations

### Prompt Engineering for Product Identification
```javascript
const analyzeProduct = async (imageUrl) => {
  const prompt = `
    Analyze this product image and provide:
    1. Product name and brand
    2. Model/SKU if visible
    3. Category and subcategory
    4. Key features and specifications
    5. Condition assessment
    6. Suggested retail price range
    Format as JSON with confidence scores.
  `;
  // Call GPT-4 Vision API
};
```

## Performance Considerations
- Lazy load images with Next.js Image component
- Implement virtual scrolling for large catalogs
- Use WebP format with fallbacks
- Cache AI results in database
- Implement progressive image loading
- Queue heavy processing tasks

## Security & Privacy
- Sanitize all user inputs
- Implement rate limiting on API routes
- Secure image URLs with signed tokens
- GDPR compliance for image storage
- Regular cleanup of orphaned images
- Audit log for product changes

## Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS
- **Database**: Supabase or PlanetScale
- **Image Storage**: Cloudinary or AWS S3
- **Queue**: Redis Cloud or AWS SQS

## Development Tips
1. Start with mock AI responses for UI development
2. Implement progressive enhancement
3. Focus on mobile-first design for camera features
4. Use optimistic UI updates for better UX
5. Implement proper error boundaries
6. Add analytics for AI accuracy tracking

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- API keys for chosen AI services

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/inventiq.git
cd inventiq

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# AI Services
OPENAI_API_KEY=""
GOOGLE_CLOUD_PROJECT_ID=""
GOOGLE_CLOUD_KEY_FILE=""

# Image Storage
CLOUDINARY_URL=""
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

## License
MIT

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.