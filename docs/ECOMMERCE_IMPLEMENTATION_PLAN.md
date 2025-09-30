# 📋 E-Commerce Implementation Plan für Inventiq

## Executive Summary
Transformation der bestehenden Inventiq Inventory Management App zu einem vollwertigen E-Commerce System mit Unterstützung für Neu- und Gebrauchtwaren.

**Projektdauer:** 6 Wochen
**Priorität:** Aufbauend auf bestehender Architektur
**Ansatz:** Schrittweise Erweiterung ohne Breaking Changes

---

## 🏗️ Ausgangslage - Bestehende Inventiq Features

### ✅ Bereits vorhanden und wird beibehalten:
- **Studio Capture System** mit professioneller Foto-Erfassung
- **MinIO S3 Storage** für Bildverwaltung
- **PostgreSQL + Prisma** Datenbank-Layer
- **AI Integration** mit GPT-4 Vision für Produktanalyse
- **Status Workflow**: DRAFT → QUEUED → ANALYZING → ANALYZED → VALIDATED → CONFIRMED
- **Dashboard** mit Statistiken und Activity Feed
- **Product Gallery** mit Lightbox
- **Multi-Photo Management** mit Primary Photo Selection
- **Docker Setup** für Deployment

### 📍 Integration Points (wo wir ansetzen):
1. **Product Model** erweitern (prisma/schema.prisma)
2. **RightSidebar** im Studio erweitern (src/components/studio/)
3. **Product Store** erweitern (src/store/product-db-store.ts)
4. **API Routes** erweitern (/api/products/)
5. **Dashboard** erweitern (src/components/home/)

---

## 📊 WOCHE 1: Datenbank & Backend Foundation

### Tag 1-2: Schema-Erweiterung (Minimal & Compatible)

#### Prisma Schema Additions
```prisma
// NEUE ENUMS (zu bestehenden hinzufügen)
enum ProductType {
  NEW
  USED
  REFURBISHED
  B_WARE
}

enum ConditionGrade {
  GRADE_A  // Excellent
  GRADE_B  // Good
  GRADE_C  // Fair
  GRADE_D  // Poor
  GRADE_N  // New
}

enum StockStatus {
  IN_STOCK
  LOW_STOCK
  OUT_OF_STOCK
  DISCONTINUED
}

// ERWEITERE bestehendes Product Model
model Product {
  // ... existing fields bleiben ALLE unverändert ...
  
  // === NEU: E-Commerce Basis ===
  productType    ProductType?   @default(NEW)
  sku            String?        @unique
  gtin           String?        // Barcode/EAN
  
  // === NEU: Erweiterte Preise ===
  retailPrice    Float?         // Verkaufspreis
  purchasePrice  Float?         // Einkaufspreis
  vatRate        Float?         @default(19)
  
  // === NEU: Bestand ===
  stockStatus    StockStatus?   @default(IN_STOCK)
  stockLocation  String?        // Lagerplatz
  minStockLevel  Int?          // Mindestbestand
  
  // === NEU: Zustand (für USED) ===
  conditionGrade ConditionGrade?
  conditionNotes String?        @db.Text
  defects        Json?         // Array von Mängeln
  
  // === NEU: SEO/Marketing ===
  shortDescription String?      @db.Text
  seoTitle        String?
  urlSlug         String?       @unique
  
  // === NEU: Relations ===
  supplier       Supplier?      @relation(fields: [supplierId], references: [id])
  supplierId     String?
}

// NEUE MODELS (additiv, keine Änderung am Bestehenden)
model Supplier {
  id           String    @id @default(cuid())
  name         String
  code         String    @unique
  email        String?
  phone        String?
  products     Product[]
}
```

#### TODOs Tag 1-2:
- [ ] Backup der Production DB
- [ ] Dev-Branch erstellen: `feature/ecommerce`
- [ ] Schema erweitern (siehe oben)
- [ ] Migration: `npx prisma migrate dev --name add-ecommerce-fields`
- [ ] Types generieren: `npx prisma generate`
- [ ] Migration testen mit Rollback

### Tag 3: TypeScript Types & Store Updates

#### Erweitere product-db-store.ts
```typescript
// In src/store/product-db-store.ts ERWEITERN (nicht ersetzen)

export interface Product {
  // ... existing fields ...
  
  // E-Commerce Extensions
  productType?: 'NEW' | 'USED' | 'REFURBISHED' | 'B_WARE'
  sku?: string | null
  gtin?: string | null
  retailPrice?: number | null
  purchasePrice?: number | null
  stockStatus?: string | null
  stockLocation?: string | null
  conditionGrade?: string | null
  conditionNotes?: string | null
}

// NEUE Store Methoden
interface ProductDBStore {
  // ... existing methods ...
  
  // New filters
  filterByType: (type: string) => Promise<Product[]>
  findBySKU: (sku: string) => Promise<Product | null>
  findByBarcode: (gtin: string) => Promise<Product | null>
  bulkUpdatePrices: (updates: PriceUpdate[]) => Promise<void>
}
```

#### TODOs Tag 3:
- [ ] Types in types/ecommerce.ts erstellen
- [ ] product-db-store.ts erweitern
- [ ] Validation schemas mit Zod
- [ ] Unit Tests für neue Store-Methoden

### Tag 4-5: API Routes Erweiterung

#### Erweitere bestehende Routes
```typescript
// /api/products/[id]/route.ts - ERWEITERN
// Neue Felder in GET/PUT/PATCH integrieren

// NEUE API Routes
// /api/products/barcode-lookup/route.ts
// /api/products/sku-generate/route.ts  
// /api/products/bulk-price-update/route.ts
```

#### TODOs Tag 4-5:
- [ ] Product API erweitern für neue Felder
- [ ] Barcode Lookup API (UPC Database)
- [ ] SKU Generator API
- [ ] Bulk Operations API
- [ ] API Tests schreiben

---

## 🎨 WOCHE 2: UI Components & Studio Integration

### Tag 6-7: Base Components

#### Neue Components (in src/components/products/)
```typescript
// ProductTypeSelector.tsx
export function ProductTypeSelector({ value, onChange }) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <Radio value="NEW">
        <Package className="w-4 h-4" />
        Neuware
      </Radio>
      <Radio value="USED">
        <RefreshCw className="w-4 h-4" />
        Gebraucht
      </Radio>
      <Radio value="REFURBISHED">
        <Wrench className="w-4 h-4" />
        Refurbished
      </Radio>
    </RadioGroup>
  )
}

// ConditionGradeSelector.tsx
// SKUInput.tsx
// BarcodeScanner.tsx (mit QuaggaJS)
// PriceCalculator.tsx
```

#### TODOs Tag 6-7:
- [ ] ProductTypeSelector Component
- [ ] ConditionGradeSelector mit Visual Guide
- [ ] SKUInput mit Auto-Generator
- [ ] BarcodeScanner Integration
- [ ] PriceCalculator mit Marge
- [ ] Component Tests

### Tag 8-9: Studio Integration

#### Erweitere RightSidebar.tsx
```typescript
// In src/components/studio/RightSidebar.tsx

export function RightSidebar({ ... }) {
  // BESTEHEND: Quantity Control bleibt
  
  return (
    <Tabs defaultValue="quantity">
      <TabsList>
        <TabsTrigger value="quantity">
          <Package /> Menge {/* BESTEHEND */}
        </TabsTrigger>
        <TabsTrigger value="type">
          <Tag /> Typ {/* NEU */}
        </TabsTrigger>
        <TabsTrigger value="pricing">
          <Euro /> Preis {/* NEU */}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="quantity">
        {/* Bestehende Quantity Controls */}
      </TabsContent>
      
      <TabsContent value="type">
        <ProductTypeSelector />
        {productType === 'USED' && <ConditionAssessment />}
      </TabsContent>
      
      <TabsContent value="pricing">
        <PriceInput label="Verkaufspreis" />
        <PriceInput label="Einkaufspreis" />
        <MarginDisplay />
      </TabsContent>
    </Tabs>
  )
}
```

#### Erweitere BottomBar.tsx
```typescript
// Neue Capture Modi
<Button onClick={() => setMode('barcode')}>
  <Barcode /> Barcode
</Button>
```

#### TODOs Tag 8-9:
- [ ] RightSidebar: Type Tab hinzufügen
- [ ] RightSidebar: Pricing Tab
- [ ] RightSidebar: Conditional Fields
- [ ] BottomBar: Barcode Mode
- [ ] CapturedImages: Condition Photos
- [ ] Integration Tests

### Tag 10: Product Gallery Updates

#### Erweitere ProductCard & Gallery
```typescript
// ProductCard erweitern
<Badge>{product.productType}</Badge>
<Badge variant={getStockVariant(product.stockStatus)}>
  {product.stockStatus}
</Badge>
{product.sku && <span className="text-xs">{product.sku}</span>}
```

#### TODOs Tag 10:
- [ ] ProductCard: Type & Condition Badges
- [ ] ProductCard: SKU Display
- [ ] Gallery: Filter Tabs (All/New/Used)
- [ ] Gallery: Advanced Filters
- [ ] Bulk Selection für Type-Änderung

---

## 📦 WOCHE 3: Product Management & Dashboard

### Tag 11-12: Product Detail Page

#### Erweitere /products/[id]/page.tsx
```typescript
// Tab-basiertes Layout
<Tabs>
  <TabsContent value="general">
    {/* Bestehende Felder + neue Basis-Felder */}
  </TabsContent>
  
  <TabsContent value="pricing">
    <PricingSection />
  </TabsContent>
  
  <TabsContent value="condition" hidden={product.productType === 'NEW'}>
    <ConditionDetails />
  </TabsContent>
  
  <TabsContent value="inventory">
    <InventoryManagement />
  </TabsContent>
</Tabs>
```

#### TODOs Tag 11-12:
- [ ] Tab Layout implementieren
- [ ] Pricing Section
- [ ] Condition Management (für USED)
- [ ] Inventory Section
- [ ] Auto-Save implementieren

### Tag 13: Dashboard Erweiterungen

#### Erweitere HomePage.tsx
```typescript
// Neue Stats Cards
<StatsCard
  title="Neuware"
  value={stats.newProducts}
  icon={<Package />}
/>
<StatsCard
  title="Gebraucht"
  value={stats.usedProducts}
  icon={<RefreshCw />}
/>
<StatsCard
  title="Lagerwert"
  value={formatCurrency(stats.totalValue)}
  icon={<Euro />}
/>
```

#### TODOs Tag 13:
- [ ] Product Type Distribution Chart
- [ ] Inventory Value Widget
- [ ] Margin Analysis Card
- [ ] Low Stock Alerts
- [ ] Update Activity Feed

### Tag 14-15: Import/Export

#### Import System
```typescript
// /app/import/page.tsx
// CSV/Excel Import mit Preview
```

#### Export Templates
```typescript
// lib/export/templates/
// - ebay.ts
// - amazon.ts
// - shopify.ts
```

#### TODOs Tag 14-15:
- [ ] Import Page UI
- [ ] CSV Parser
- [ ] Import Preview & Validation
- [ ] Export Templates
- [ ] Bulk Operations

---

## 🛍️ WOCHE 4: Marketplace & Advanced Features

### Tag 16-18: Marketplace Basics

#### Neue Page: /marketplace
```typescript
// Multi-Channel Management Dashboard
```

#### TODOs Tag 16-18:
- [ ] Marketplace Dashboard
- [ ] eBay Export Template
- [ ] Amazon Export Template
- [ ] Listing Status Tracking
- [ ] Platform Fee Calculator

### Tag 19-20: AI Enhancements

#### Erweitere AI Analysis
```typescript
// In /api/ai/analyze/route.ts
// - Product Type Detection
// - Condition Assessment
// - Barcode Recognition
```

#### TODOs Tag 19-20:
- [ ] AI Type Detection
- [ ] AI Condition Grading
- [ ] OCR für Seriennummern
- [ ] Smart Price Suggestions
- [ ] Batch AI Processing

---

## 🧪 WOCHE 5: Testing & Optimization

### Tag 21-23: Testing
- [ ] Unit Tests für alle neuen Components
- [ ] Integration Tests für Workflows
- [ ] E2E Tests für kritische Pfade
- [ ] Performance Tests
- [ ] Security Audit

### Tag 24-25: Optimization
- [ ] Database Query Optimization
- [ ] Image Loading Optimization
- [ ] Bundle Size Reduction
- [ ] Caching Strategy
- [ ] Error Handling

---

## 🚀 WOCHE 6: Migration & Deployment

### Tag 26-27: Data Migration
- [ ] Migration Script für bestehende Produkte
- [ ] Set Default productType = 'NEW'
- [ ] Generate SKUs für alte Produkte
- [ ] Validate all data
- [ ] Create rollback plan

### Tag 28-29: Documentation
- [ ] Update CLAUDE.md
- [ ] API Documentation
- [ ] User Guide
- [ ] Video Tutorials
- [ ] Release Notes

### Tag 30: Go-Live
- [ ] Final Testing
- [ ] Production Backup
- [ ] Deploy to Production
- [ ] Monitor Performance
- [ ] User Feedback Collection

---

## 🎯 Kritischer Pfad (MVP in 3 Wochen)

### Woche 1: Must-Have Backend
- Schema-Erweiterung (productType, sku, prices)
- API Updates
- Store Erweiterung

### Woche 2: Must-Have UI
- ProductTypeSelector
- Studio Integration
- Basic Pricing

### Woche 3: Must-Have Features
- Product Detail Updates
- Dashboard Stats
- Basic Import/Export

### Optional (Post-MVP):
- Marketplace Integration
- Advanced AI Features
- Analytics Dashboard
- Multi-Warehouse
- B2B Features

---

## ✅ Success Metrics

### Technical KPIs:
- Zero Breaking Changes
- All existing features working
- <2s page load time
- 95% test coverage for new code

### Business KPIs:
- Product creation 40% faster with barcode
- Export to marketplaces in <5 min
- 30% better price accuracy
- Complete product data for 95% items

---

## 🔄 Rollback Plan

Falls Probleme auftreten:
1. Database: Migrations sind reversibel
2. Code: Git feature branch kann verworfen werden
3. Backup: Tägliche DB-Backups vorhanden
4. Staging: Alles wird zuerst auf Staging getestet

---

## 📝 Notes

- **Keine Breaking Changes**: Alle bestehenden Features bleiben funktionsfähig
- **Schrittweise Migration**: Jede Woche ist eigenständig deploybar
- **User-First**: Änderungen werden schrittweise eingeführt
- **Performance**: Neue Features dürfen Performance nicht beeinträchtigen

---

## 🚦 Go/No-Go Checkpoints

### Ende Woche 1:
- [ ] Schema erweitert ohne Fehler
- [ ] Alle Tests grün
- [ ] Performance unverändert

### Ende Woche 2:
- [ ] UI funktioniert für NEW/USED
- [ ] Studio Capture weiterhin stabil

### Ende Woche 3:
- [ ] Import/Export funktioniert
- [ ] User Feedback positiv

### Vor Go-Live:
- [ ] Alle kritischen Features getestet
- [ ] Performance Benchmarks erfüllt
- [ ] Rollback Plan verifiziert

---

**Dokument Version:** 1.0
**Erstellt:** ${new Date().toISOString()}
**Autor:** Claude Code Assistant
**Status:** Ready for Review