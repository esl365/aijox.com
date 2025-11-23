# PWA Icons Guide

## Required Icons

To complete the PWA setup, the following icon files need to be created:

### Standard Icons (9 files)
- `icon-72x72.png` - 72x72px
- `icon-96x96.png` - 96x96px
- `icon-128x128.png` - 128x128px
- `icon-144x144.png` - 144x144px
- `icon-152x152.png` - 152x152px
- `icon-192x192.png` - 192x192px
- `icon-384x384.png` - 384x384px
- `icon-512x512.png` - 512x512px
- `maskable-icon-512x512.png` - 512x512px with safe zone

### Apple Touch Icon
- `apple-touch-icon.png` - 180x180px

### Shortcut Icons (3 files)
- `shortcut-jobs.png` - 96x96px (briefcase or search icon)
- `shortcut-apps.png` - 96x96px (document or list icon)
- `shortcut-profile.png` - 96x96px (user or avatar icon)

## Design Guidelines

### Brand Colors
- Primary: `#3b82f6` (Blue)
- Background: `#ffffff` (White)
- Text: `#1f2937` (Dark Gray)

### Icon Design Requirements
1. **Simple and recognizable** at small sizes
2. **Consistent branding** across all sizes
3. **High contrast** for visibility
4. **No text** in icons (use symbols/logos only)
5. **Transparent background** for standard icons
6. **Solid background** for maskable icon

### Maskable Icon Safe Zone
The maskable icon must have important content within the **80% safe zone** (center circle).
- Outer 10% on all sides may be cropped on some devices
- Use a solid background color
- Center the logo/symbol

## Icon Generation Tools

### Recommended Tools

1. **PWA Asset Generator** (Automated)
```bash
npm install -g pwa-asset-generator
pwa-asset-generator [source-image] public/icons --manifest public/manifest.json
```

2. **RealFaviconGenerator** (Online)
https://realfavicongenerator.net/

3. **Figma/Adobe XD** (Manual)
- Create artboards for each size
- Export as PNG with @1x resolution

### Using PWA Asset Generator

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate icons from source image (1024x1024px recommended)
pwa-asset-generator ./source-logo.png public/icons \
  --manifest public/manifest.json \
  --icon-only \
  --favicon \
  --maskable \
  --type png \
  --background "#3b82f6"
```

## Validation

After generating icons, validate:

1. **File sizes**: Each icon should be < 50KB
2. **Dimensions**: Exactly match specified sizes
3. **Format**: PNG with proper color depth
4. **Transparency**: Standard icons should have transparency
5. **Manifest**: Icons correctly referenced in `manifest.json`

### Validation Checklist

```bash
# Check icon files exist
ls -lh public/icons/

# Validate dimensions with imagemagick
identify public/icons/*.png

# Validate manifest
npx pwa-manifest-validator public/manifest.json
```

## Placeholder Icons

For development/testing, you can generate simple placeholder icons:

```bash
# Create a simple placeholder (requires imagemagick)
convert -size 512x512 xc:"#3b82f6" \
  -gravity center \
  -pointsize 200 \
  -fill white \
  -annotate +0+0 "EN" \
  public/icons/icon-512x512.png
```

## iOS Considerations

iOS requires additional meta tags (already added in root layout):

```html
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="EduNexus" />
```

## Testing

After adding icons:

1. **Lighthouse PWA Audit**
   - Should show all icons present
   - Maskable icon properly configured

2. **Device Testing**
   - iOS Safari: Add to Home Screen
   - Android Chrome: Install app
   - Desktop Chrome: Check install prompt

3. **Visual Verification**
   - Icons appear correctly
   - No distortion or pixelation
   - Proper safe zone for maskable

## Resources

- [Maskable Icon Editor](https://maskable.app/editor)
- [Web.dev PWA Icon Guide](https://web.dev/add-manifest/#icons)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

**Next Steps:**
1. Provide source logo (1024x1024px, PNG with transparency)
2. Run PWA Asset Generator
3. Validate generated icons
4. Test on actual devices
