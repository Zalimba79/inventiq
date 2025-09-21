# Inventiq Workflow Automation

## 🎯 Optimierte Workflows für dein Projekt

### 1. **Feature Development Workflow**
```bash
# Beispiel: Neues Feature entwickeln
claude "Implementiere Barcode-Scanner Feature"

# Automatisch aktiviert:
# ✅ TodoWrite (>3 steps)
# ✅ --think (Analyse)
# ✅ --typescript-sdk (TypeScript support)
# ✅ --validate (Pre-execution checks)
# ✅ Prettier + ESLint (Post-hooks)
```

### 2. **Bug Fixing Workflow**
```bash
# Beispiel: Bug analysieren und fixen
claude "Photos werden nicht korrekt gespeichert - debug und fix"

# Automatisch aktiviert:
# ✅ --introspect (Meta-cognitive debugging)
# ✅ --sequential (Deep analysis)
# ✅ Test runner nach Fix
```

### 3. **UI Enhancement Workflow**
```bash
# Beispiel: UI Component verbessern
claude "Verbessere Product Gallery mit modernem Design"

# Automatisch aktiviert:
# ✅ --magic (21st.dev patterns)
# ✅ --delegate (Parallel processing)
# ✅ Responsive design checks
```

### 4. **Database Migration Workflow**
```bash
# Beispiel: Von localStorage zu PostgreSQL
claude "Migriere Datenspeicherung zu PostgreSQL"

# Automatisch aktiviert:
# ✅ --safe-mode (Production safety)
# ✅ --think-hard (Deep analysis)
# ✅ Backup reminders
# ✅ Migration validation
```

## 🔄 Automatische Trigger

### Code-basierte Trigger
```yaml
# Wenn du mit bestimmten Files arbeitest:

"*.prisma":
  auto_flags: ["--safe-mode", "--validate"]
  tools: ["sequential-thinking"]
  
"**/api/**":
  auto_flags: ["--think", "--validate"]
  validation: ["type-check", "test"]
  
"**/components/**":
  auto_flags: ["--magic"]
  post_hooks: ["prettier", "eslint"]
  
"**/*.test.ts":
  auto_flags: ["--puppeteer"]
  runner: "jest"
```

### Keyword-basierte Trigger
```yaml
# Basierend auf deinen Anfragen:

"performance|optimize|slow":
  mode: "--ultrathink"
  tools: ["deep-graph", "sequential"]
  
"test|e2e|integration":
  mode: "--validate"
  tools: ["puppeteer", "jest"]
  
"ui|component|design":
  mode: "--delegate"
  tools: ["magic"]
  
"debug|error|fix":
  mode: "--introspect"
  tools: ["sequential-thinking"]
```

## 📝 Task Templates

### Template: Add New Product Feature
```typescript
// Automatisch generiert bei "Add feature for products"
interface TaskPlan {
  phases: [
    { name: "Analysis", tasks: ["Review existing", "Plan integration"] },
    { name: "Implementation", tasks: ["Create components", "Add store logic"] },
    { name: "Testing", tasks: ["Unit tests", "Integration tests"] },
    { name: "Documentation", tasks: ["Update CLAUDE.md", "Add comments"] }
  ]
}
```

### Template: Performance Optimization
```typescript
// Automatisch bei "optimize" keywords
interface OptimizationPlan {
  measure: ["Current metrics", "Bottlenecks"],
  optimize: ["Apply fixes", "Lazy loading", "Code splitting"],
  validate: ["Performance tests", "Bundle analysis"]
}
```

## 🚀 Quick Commands

### Projekt-Status
```bash
# Status prüfen
claude status          # Zeigt Projekt-Übersicht
claude metrics        # Performance Metriken
claude todos          # Aktuelle Tasks
```

### Development
```bash
# Quick Actions
claude dev            # Startet dev server
claude test           # Führt Tests aus
claude lint           # Linted codebase
claude build          # Production build
```

### AI Features
```bash
# Spezifisch für Inventiq
claude analyze-product   # Testet AI-Analyse
claude test-capture      # Testet Kamera-Capture
claude validate-flow     # Prüft gesamten Workflow
```

## 🔧 Custom Aliases

Füge diese zu deiner Shell config hinzu:
```bash
# ~/.zshrc oder ~/.bashrc
alias inv-dev="cd ~/Development/Inventiq && npm run dev"
alias inv-test="cd ~/Development/Inventiq && npm test"
alias inv-analyze="cd ~/Development/Inventiq && claude 'Analysiere Code-Qualität' --ultrathink"
alias inv-feature="cd ~/Development/Inventiq && claude"
```

## 📊 Monitoring & Alerts

### Auto-Alerts konfiguriert für:
- ⚠️ localStorage > 4MB
- ⚠️ Bundle size > 500KB increase
- ⚠️ TypeScript errors
- ⚠️ Failing tests
- ⚠️ Console.log in production code

### Performance Tracking
```javascript
// Automatisch injiziert in dev mode
window.__INVENTIQ_PERF = {
  photoCapture: [], // Capture timings
  aiAnalysis: [],   // AI processing times
  storage: []       // Storage operations
};
```

## 🎨 Style Guide Enforcement

### Automatisch enforced:
- ✅ Tailwind class ordering
- ✅ Component naming (PascalCase)
- ✅ File structure conventions
- ✅ Import ordering
- ✅ TypeScript strict mode

## 🔐 Security Checks

### Automatisch bei jedem Edit:
- API key exposure check
- Dependency vulnerability scan
- XSS prevention validation
- SQL injection prevention (when DB connected)

## 💾 Backup Strategy

### Auto-Backup Trigger:
- Vor major changes
- Bei Database migrations
- Vor dependency updates
- Alle 2 Stunden bei aktiver Session

### Backup Command:
```bash
claude backup         # Erstellt timestamped backup
claude restore [id]   # Restored specific backup
```

---

**Status**: Alle Workflows sind konfiguriert und werden automatisch aktiviert! 🎉