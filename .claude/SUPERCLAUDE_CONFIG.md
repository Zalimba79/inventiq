# SuperClaude Configuration für Inventiq

## 🚀 Aktivierte SuperClaude Features

### 1. **Intelligent Mode Selection** ✅
- **--brainstorm**: Für neue Feature-Ideen
- **--introspect**: Für Debugging und Analyse
- **--task-manage**: Für komplexe Features (automatisch bei >3 Steps)
- **--orchestrate**: Für Multi-Tool Operations
- **--token-efficient**: Bei großen Operations (automatisch bei >75% Context)

### 2. **MCP Server Integration** 🔧
```bash
# Aktiviere spezifische MCP Server für dein Projekt:

# Für TypeScript/React Development
--typescript-sdk    # TypeScript-spezifische Funktionen
--sequential        # Komplexe Analyse und Debugging
--memory-bank       # Session-Memory und Persistenz

# Für UI Development  
--magic            # Modern UI Components (21st.dev)
--puppeteer        # Browser Testing und E2E

# Für Code Quality
--deep-graph       # Code-Graphen und Abhängigkeiten
--morphllm         # Bulk Code Transformations
```

### 3. **Business Panel Mode** 📊
```bash
# Für strategische Entscheidungen
/sc:business-panel "Soll ich Postgres oder MongoDB verwenden?"
/sc:business-panel @business_plan.md --experts "drucker,christensen"
```

### 4. **Analysis Depth Flags** 🔍
```bash
# Standard Analyse
--think           # ~4K tokens, moderate complexity

# Deep Analysis  
--think-hard      # ~10K tokens, system-wide analysis

# Maximum Analysis
--ultrathink      # ~32K tokens, critical decisions
```

### 5. **Execution Control** ⚡
```bash
# Parallel Processing
--delegate auto   # Automatische Parallelisierung bei >7 dirs oder >50 files
--concurrency 10  # Max 10 parallele Operationen

# Iterative Improvement
--loop           # Automatische Verbesserungszyklen
--iterations 3   # 3 Verbesserungs-Iterationen

# Validation
--validate       # Pre-execution Validation
--safe-mode      # Maximum Safety für Production
```

## 📁 Project-Specific Optimizations

### Inventiq-spezifische Commands
```bash
# AI Feature Development
claude "Implementiere Barcode-Scanner" --think --typescript-sdk

# UI Components
claude "Erstelle moderne Product Gallery" --magic --delegate

# Testing
claude "Schreibe E2E Tests für Capture Flow" --puppeteer --validate

# Performance
claude "Optimiere Image Storage" --ultrathink --token-efficient

# Database Migration
claude "Migriere zu PostgreSQL" --sequential --safe-mode
```

### Workflow Automation
```yaml
# Auto-aktivierte Features basierend auf Context:

image_processing:
  triggers: ["photo", "image", "camera", "capture"]
  auto_flags: ["--think", "--validate"]
  
ai_integration:
  triggers: ["GPT-4", "OpenAI", "analyze", "identify"]
  auto_flags: ["--sequential", "--validate"]
  
database_work:
  triggers: ["Prisma", "PostgreSQL", "migration", "schema"]
  auto_flags: ["--safe-mode", "--think-hard"]

ui_development:
  triggers: ["component", "UI", "design", "layout"]
  auto_flags: ["--magic", "--delegate"]
```

## 🔄 Session Persistence

### Auto-Save Points
- Nach jedem Major Feature ✅
- Alle 30 Minuten ✅
- Vor riskanten Operationen ✅

### Session Commands
```bash
# Session speichern
/sc:save              # Speichert aktuellen Status

# Session laden
/sc:load              # Lädt letzten Status
/sc:load session_id   # Lädt spezifische Session

# Session-Info
/sc:status            # Zeigt aktuellen Session-Status
/sc:history           # Zeigt Session-Historie
```

## 🛡️ Safety Features

### Aktivierte Hooks
- ✅ **Prettier** nach jedem Edit
- ✅ **TypeScript Check** nach Code-Änderungen  
- ✅ **ESLint** bei Session-Ende
- ✅ **Test Runner** nach relevanten Änderungen
- ✅ **Bundle Size Check** bei Dependencies

### Verbotene Operationen
- ❌ `rm -rf` ohne Bestätigung
- ❌ Direct curl/wget (nutze WebFetch)
- ❌ Production commits ohne Tests

## 💡 Pro Tips

### 1. **Batch Operations**
```bash
# Schlecht ❌
claude "Read file1" && claude "Read file2" && claude "Read file3"

# Gut ✅  
claude "Analysiere alle Product Components" --delegate
```

### 2. **Smart Tool Selection**
```bash
# Für mehrere File-Edits
MultiEdit > Sequential Edit calls

# Für Code-Suche
Grep tool > bash grep

# Für UI Components
Magic MCP > manual coding
```

### 3. **Context Management**
```bash
# Bei großen Operations
--uc              # Ultra-compressed output
--scope module    # Begrenzt Analyse-Scope
--focus security  # Fokussiert auf Security
```

## 🚦 Quick Start Commands

```bash
# Feature entwickeln
claude "Implementiere Export zu CSV" --task-manage --think

# Bug fixen
claude "Debug: Fotos werden nicht gespeichert" --introspect --sequential

# UI verbessern  
claude "Modernisiere Product Gallery" --magic --delegate

# Performance
claude "Optimiere localStorage usage" --ultrathink --validate

# Tests schreiben
claude "Schreibe Tests für AI Integration" --puppeteer --loop
```

## 📊 Monitoring

### Performance Metrics
- Token Usage: Check mit `--uc` bei >75%
- Execution Time: Nutze `--concurrency` für Parallelisierung
- Quality Gates: Automatisch durch Hooks

### Debug Commands
```bash
# Session Debug
/sc:debug             # Zeigt Debug-Info
/sc:memory            # Zeigt Memory Usage

# Tool Debug
/tools                # Zeigt verfügbare Tools
/mcp-status          # Zeigt MCP Server Status
```

## 🔗 Integration Points

### VS Code Integration
- Auto-complete aus `.claude/` configs
- Inline suggestions basierend auf Patterns
- Error highlighting durch Hooks

### Git Integration  
- Pre-commit Hooks durch Settings
- Auto-format vor Commit
- Test-Runner Integration

### CI/CD Ready
- GitHub Actions kompatibel
- Automated Testing Support
- Deployment Validation

---

**Aktivierung**: Diese Features sind bereits konfiguriert und werden automatisch bei relevanten Tasks aktiviert! 🎉