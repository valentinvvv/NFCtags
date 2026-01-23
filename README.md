# Filament Tags

A web-based application for creating and managing NFC tags for 3D printing filament spools with OpenSpool format support.

<div align="center">
  <img src="scr/1000057812.jpg" alt="Filament Tag Generator - Main Screen" width="300"/>
</div>

## Features

### 🏷️ **NFC Tag Writing**
Write filament information to NFC tags using Web NFC API

### 📱 **Mobile-Optimized**
Touch-friendly interface designed for mobile devices

### 📷 **Camera Color Picker**
Extract colors directly from filament spools using your device camera

<div align="center">
  <img src="scr/1000057818.jpg" alt="Camera Color Capture" width="300"/>
</div>

### 🎨 **Advanced HSV Color Picker**
Precise color selection with hue, saturation, and brightness controls

<div align="center">
  <img src="scr/1000057816.jpg" alt="Color Picker Interface" width="300"/>
</div>

### 📦 **Material Presets & Temperature Ranges**
Database of 70+ filament materials with market-standard temperature presets

<div align="center">
  <img src="scr/1000057814.jpg" alt="Material Type Selection" width="300"/>
</div>

### ✅ **Filament Profile Validation**

The application validates selected filament combinations against actual Bambu Lab slicer profiles:

- **🟢 Green (Validated)**: Exact profile match found (e.g., "Generic PLA High Speed" exists)
- **🟡 Yellow (Compatible)**: Profile not exact, but compatible alternative selected (e.g., "HIPS-CF" → uses "Generic ABS")

This ensures your filament settings are compatible with the slicer configuration.

### 🔄 **Subtype Support**

Supports filament subtypes (variants) for precise profile matching:
- **PLA**: Basic, High Speed, Silk
- **PETG**: Basic, HF (High Flow)
- **Specialty materials**: Carbon-Graphene, Metal variants, Wood, Stone

## Version History

### v1.1 (2026-01-23)

**Improvements:**
- ✨ **Enhanced filament validation logic** - Checks exact Material+Subtype combinations first, then falls back to Material-only matches
- 🔧 **Refactored temperature presets** - Extracted to dedicated `presets.js` module for maintainability
- 🧹 **Removed debug logs** - Cleaner console output for production use
- 🐛 **Fixed subtype matching** - Materials like "PLA High Speed" now correctly resolve to exact profiles when available
- 📊 **Validation alerts** - Clear visual feedback on profile compatibility (Green/Yellow warnings)

### v1.0
- Initial release with NFC writing, color picker, and OpenSpool format support

## Usage

1. Open `index.html` in a modern web browser
2. Choose mode: **Create New Tag** or **Read / Update Tag**
3. Fill in filament details:
   - Material type (PLA, PETG, ABS, etc.)
   - Type/Subtype (Basic, High Speed, Silk, etc.)
   - Brand name
   - Color (palette, spectrum picker, or camera)
   - Temperature ranges
4. Review validation alert (Green = exact match, Yellow = compatible fallback)
5. Download JSON or write directly to NFC tag

## Requirements

- Modern web browser with Web NFC API support (Chrome/Edge on Android)
- NFC-enabled device for tag writing and reading
- Camera access for color picker feature (optional)

## File Structure

```
.
├── index.html              # Main application interface
├── app.js                  # Application logic, event handling, color picker
├── openspool.js            # OpenSpool format & NFC operations
├── filament-generator.js   # Filament JSON generation & validation
├── presets.js              # Temperature presets database (70+ materials)
└── README.md               # This file
```

## Technical Details

### Filament Profile Matching

The validation system follows a 4-tier hierarchy:

1. **Exact Match** (Green ✅)
   - Looks for exact profile name in `filamentProfiles` array
   - Example: "Generic PLA High Speed" → found → valid

2. **Material + Subtype Lookup** (Yellow ⚠️)
   - Queries `materialInheritance` map for Material + Subtype combination
   - Example: "PLA" + "High Speed" → maps to "Generic PLA High Speed"

3. **Material-Only Lookup** (Yellow ⚠️)
   - Falls back to base material if subtype not found
   - Example: "HIPS-CF" → maps to "Generic ABS"

4. **System Default** (Yellow ⚠️)
   - Last resort fallback to "Generic PETG" if no mapping exists

### Supported Filament Types

- **Base Materials**: PLA, PETG, ABS, ASA, PA, PC, TPU, PVA, BVOH, PP, PEEK, PEI, HIPS
- **Composites**: Carbon-Fiber (-CF), Glass-Fiber (-GF) variants
- **Specialty**: Wood, Stone, Metal (Copper/Bronze/Brass), Carbon-Graphene
- **Variants**: High Speed, Silk Finish, eco variants (ecoPLA, easyPETG, etc.)

## Browser Support

| Browser | NFC Support | Color Picker | Camera |
|---------|------------|--------------|--------|
| Chrome/Edge (Android) | ✅ Yes | ✅ Yes | ✅ Yes |
| Firefox (Android) | ✅ Partial | ✅ Yes | ✅ Yes |
| Safari (iOS) | ❌ No | ✅ Yes | ✅ Yes |
| Desktop Browsers | ❌ No | ✅ Yes | ✅ Yes* |

*Desktop requires camera device or webcam

## Known Limitations

- NFC writing limited to devices with Web NFC API support (Android Chrome/Edge)
- NTAG213 max ~180 bytes; NTAG216 max ~880 bytes (size warning in UI)
- Camera color picker requires camera permissions

## License

MIT License

## Credits

- OpenSpool format: [openspool.io](https://openspool.io)
- Bambu Lab for slicer profile reference
- Community contributions and filament data

---

**Maintained by**: [valentinvvv](https://github.com/valentinvvv)
