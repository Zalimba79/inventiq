# Premium Lightbox Features Guide

## Visible Features You Should See:

### Top Bar (Always Visible)
- **Product Name** - Top left
- **Photo Counter** (e.g., "1 / 4") - Next to product name
- **Zoom Controls** - Minus and plus buttons with percentage display
- **Star Icon** - Set as primary photo (yellow when primary)
- **Rotate Icon** - Rotate image 90 degrees
- **Info Icon** (i) - Toggle photo information panel
- **Fullscreen Icon** - Enter fullscreen mode
- **Trash Icon** - Delete photo (if more than 1 photo)
- **X Close Button** - Top right corner

### Main View
- **Left/Right Arrow Buttons** - Navigate between photos (only if multiple photos)
- **Main Image** - Center of screen, rotatable and zoomable

### Bottom Section
- **Thumbnail Strip** - Row of small preview images
- **Current Photo Highlight** - White border on active thumbnail
- **Primary Star** - Small star on primary photo thumbnail

### Info Panel (Toggle with 'i' key or info button)
- Shows when info is enabled:
  - Photo dimensions (width × height)
  - File size in KB
  - MIME type
  - Current rotation angle
  - Primary status

## How to Test Each Feature:

1. **Open Lightbox**: Click any product photo in draft page
2. **Navigate**: Use arrow keys or click arrow buttons
3. **Rotate**: Press 'R' key or click rotate button
4. **Zoom**: Press '+'/'-' keys or click zoom buttons
5. **Info Panel**: Press 'I' key or click info button
6. **Fullscreen**: Press 'F' key or click fullscreen button
7. **Set Primary**: Click star button (updates database)
8. **Delete**: Click trash icon (confirmation required)
9. **Thumbnails**: Click any thumbnail to jump to that photo

## Keyboard Shortcuts:
- **←/→**: Navigate photos
- **R**: Rotate 90°
- **+/-**: Zoom in/out
- **0**: Reset zoom to 100%
- **F**: Toggle fullscreen
- **I**: Toggle info panel
- **Delete**: Delete current photo
- **Esc**: Close lightbox

## If Features Are Missing:

1. **Check Browser Console** for errors (F12 → Console)
2. **Hard Refresh** the page (Cmd+Shift+R on Mac)
3. **Clear Browser Cache** if needed
4. **Check Z-Index** - All controls should be above z-9999

The lightbox should look like a professional photo gallery with dark theme and all controls visible on hover/interaction.