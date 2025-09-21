# Inventiq - Troubleshooting Guide

## Common Issues and Solutions

### 1. CORS / Access Control Errors

**Error**: `Fetch API cannot load ... due to access control checks`

**Solutions**:
- The Next.js config has been updated to allow CORS in development
- Access the application directly at `http://localhost:3000`
- If accessing from a different device/IP, use your local network IP

### 2. Camera Permission Issues

**Error**: Camera not working or permission denied

**Solutions**:
1. **Browser Settings**:
   - Chrome: Settings → Privacy → Site Settings → Camera
   - Firefox: Settings → Privacy → Permissions → Camera
   - Safari: Safari → Settings → Websites → Camera

2. **HTTPS Requirement** (Production):
   - Browsers require HTTPS for camera access
   - Use `localhost` for development (exempt from HTTPS requirement)
   - For network testing, use tools like `ngrok` or `localtunnel`

3. **Mobile Testing**:
   ```bash
   # Find your local IP
   ifconfig | grep inet
   # Access from mobile: http://[YOUR_IP]:3000
   ```

### 3. Hot Reload Not Working

**Issue**: Changes not reflecting immediately

**Solutions**:
- React Strict Mode has been disabled in `next.config.js`
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Restart the dev server: 
  ```bash
  # Stop server (Ctrl+C)
  npm run dev
  ```

### 4. Webpack Compilation Errors

**Error**: `Unexpected EOF` or compilation failures

**Solutions**:
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for syntax errors:
   ```bash
   npm run typecheck
   npm run lint
   ```

### 5. Upload Queue Not Working

**Issue**: Photos not uploading

**Current Status**:
- Upload queue simulates uploads (no backend yet)
- Photos are stored in browser memory
- Implement actual upload endpoint in `/api/upload`

**Next Steps**:
```typescript
// Create: src/app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  // Implement actual upload logic
  return Response.json({ url: 'uploaded-url' })
}
```

### 6. Performance Issues

**Issue**: Application running slowly

**Solutions**:
1. **Limit photo size**:
   - Reduce camera resolution in `CameraView.tsx`
   - Compress images before storing

2. **Clear session data**:
   - Sessions are stored in memory
   - Clear old sessions regularly

3. **Browser memory**:
   - Base64 images use significant memory
   - Consider blob URLs for better performance

### 7. Mobile Responsiveness

**Issue**: Layout issues on mobile

**Solutions**:
- Application is mobile-first designed
- Test with browser DevTools mobile emulation
- Ensure viewport meta tag is present (handled by Next.js)

## Quick Fixes

### Reset Everything
```bash
# Complete reset
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Check Application Health
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Build test
npm run build
```

### Environment Variables
Ensure `.env.local` exists with:
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC Camera | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| PWA Support | ✅ | ✅ | ⚠️ | ✅ |

## Getting Help

1. Check browser console for errors (F12)
2. Review server logs in terminal
3. Verify all dependencies are installed
4. Ensure Node.js version is 18+

## Contact Support

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Project README](./README.md)