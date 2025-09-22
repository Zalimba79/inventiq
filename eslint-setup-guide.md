# ESLint Configuration Setup Guide for Inventiq

## Required Dependencies

To use the comprehensive ESLint configuration, install these additional packages:

```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import \
  eslint-import-resolver-typescript \
  eslint-plugin-prefer-arrow \
  eslint-plugin-unicorn \
  eslint-plugin-security \
  eslint-plugin-testing-library \
  eslint-plugin-jest
```

## Configuration Highlights

### 🔒 **Type Safety & Error Prevention**
- **Strict TypeScript rules**: Prevents `any` usage, enforces proper typing
- **Async/await safety**: Catches floating promises and misused promises
- **Import validation**: Prevents circular dependencies and unresolved imports
- **Security scanning**: Detects potential security vulnerabilities

### ⚛️ **React & Next.js Best Practices**
- **Component optimization**: Prevents unstable nested components
- **Hook dependency tracking**: Ensures proper useEffect dependencies
- **Key prop validation**: Enforces proper React key usage
- **Next.js App Router**: Specific rules for App Router patterns

### ♿ **Accessibility Standards**
- **ARIA compliance**: Validates ARIA attributes and roles
- **Keyboard navigation**: Ensures interactive elements are accessible
- **Alt text validation**: Requires proper image descriptions
- **Semantic HTML**: Promotes accessible markup patterns

### 📱 **Camera & WebRTC Specific Rules**
- **Navigator API safety**: Requires feature detection before using camera APIs
- **Permission handling**: Validates proper error handling for media permissions
- **Async operations**: Ensures camera streams are properly managed

### 🗄️ **Storage & State Management**
- **LocalStorage safety**: Requires quota error handling for storage operations
- **Zustand store patterns**: Optimized rules for state management
- **IndexedDB operations**: Validates async database operations

### 🧪 **Testing Standards**
- **Testing Library best practices**: Enforces proper query usage
- **Jest patterns**: Consistent test structure and assertions
- **Async testing**: Proper handling of async test operations

## Script Updates

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:strict": "eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0",
    "lint:check": "eslint . --ext .ts,.tsx,.js,.jsx",
    "typecheck": "tsc --noEmit",
    "quality": "npm run typecheck && npm run lint:strict"
  }
}
```

## VS Code Integration

Create or update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## GitHub Actions Integration

Create `.github/workflows/lint.yml`:

```yaml
name: Lint and Type Check
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint:strict
```

## Configuration Sections Explained

### TypeScript Rules
- **Type Safety**: Prevents `any` usage, enforces explicit types where needed
- **Async Handling**: Catches unhandled promises and async/await issues
- **Modern Syntax**: Prefers nullish coalescing and optional chaining
- **Import Style**: Enforces consistent type imports

### React Rules
- **Component Quality**: Prevents common React anti-patterns
- **Performance**: Identifies performance issues like unstable components
- **JSX Standards**: Enforces consistent JSX formatting and best practices
- **Hook Usage**: Validates proper React Hook patterns

### Accessibility Rules
- **WCAG Compliance**: Enforces Web Content Accessibility Guidelines
- **Screen Reader Support**: Ensures proper ARIA attributes
- **Keyboard Navigation**: Validates interactive element accessibility
- **Image Accessibility**: Requires descriptive alt text

### Import Organization
```typescript
// Enforced import order:
import React from 'react'           // 1. React
import { NextPage } from 'next'     // 2. Next.js
import { Button } from 'antd'       // 3. External libraries
import { Camera } from '@/components' // 4. Internal (@/ imports)
import { helper } from '../utils'   // 5. Relative imports
import type { Props } from './types' // 6. Type imports
```

### Security Rules
- **Code Injection**: Detects potential XSS and injection vulnerabilities
- **Unsafe Patterns**: Identifies risky JavaScript patterns
- **API Security**: Validates secure API usage patterns
- **File System Safety**: Prevents unsafe file operations

## Migration Guide

### 1. Install Dependencies
```bash
npm install --save-dev [packages listed above]
```

### 2. Fix Immediate Issues
```bash
npm run lint:fix
```

### 3. Address Manual Fixes
Common issues you'll need to fix manually:
- Add missing `alt` props to images
- Update import statements to match new order
- Add proper TypeScript types where `any` is used
- Fix accessibility issues in interactive elements

### 4. Gradual Adoption
For large codebases, consider temporarily disabling strict rules:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",  // Instead of "error"
    "jsx-a11y/click-events-have-key-events": "off" // Temporarily disable
  }
}
```

## Project-Specific Considerations

### Camera Components
- Always include proper accessibility attributes for camera controls
- Handle camera permission errors gracefully
- Provide keyboard alternatives for camera actions

### AI Integration
- Validate OpenAI API responses with proper type checking
- Handle async AI operations with proper error boundaries
- Ensure user feedback during AI processing

### State Management (Zustand)
- Use TypeScript interfaces for store state
- Implement proper error handling in store actions
- Consider performance implications of store updates

### Image Processing
- Handle file size limits and compression errors
- Provide user feedback for long-running operations
- Implement proper cleanup for temporary resources

## Performance Impact

The ESLint configuration is optimized for development:
- **Caching**: Uses TypeScript project references for faster linting
- **Incremental**: Only lints changed files in most scenarios
- **Parallel**: Runs type checking and linting in parallel where possible

Expected lint times:
- **Initial run**: 15-30 seconds (full project)
- **Incremental**: 2-5 seconds (changed files only)
- **CI/CD**: 30-60 seconds (full validation)

## Troubleshooting

### Common Issues

1. **Memory Issues**: Increase Node.js memory limit
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Import Resolution**: Ensure TypeScript paths match ESLint resolver
   ```json
   // tsconfig.json and eslint config should match
   "paths": { "@/*": ["./src/*"] }
   ```

3. **Type Checking Performance**: Use project references
   ```bash
   npx tsc --build --incremental
   ```

### Selective Disabling

For urgent fixes, disable specific rules:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiResponse: any = await fetch('/api/data')

/* eslint-disable jsx-a11y/click-events-have-key-events */
<div onClick={handleClick}>Interactive div</div>
/* eslint-enable jsx-a11y/click-events-have-key-events */
```

## Future Enhancements

Consider adding these plugins as the project grows:
- `eslint-plugin-sonarjs`: Advanced code quality rules
- `eslint-plugin-promise`: Promise-specific best practices
- `eslint-plugin-node`: Node.js best practices for API routes
- `eslint-plugin-perfectionist`: Advanced sorting and organization

## Conclusion

This ESLint configuration provides:
- ✅ **Type Safety**: Comprehensive TypeScript validation
- ✅ **Code Quality**: Modern JavaScript best practices
- ✅ **Accessibility**: WCAG compliance and inclusive design
- ✅ **Performance**: Optimized React patterns
- ✅ **Security**: Vulnerability detection and prevention
- ✅ **Maintainability**: Consistent code organization

The configuration is specifically tailored for the Inventiq project's:
- Camera/WebRTC functionality
- AI integration patterns
- State management with Zustand
- Image processing requirements
- Accessibility needs for inventory management