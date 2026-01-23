# Changelog

All notable changes to this project will be documented in this file.

## [1.1] - 2026-01-23

### ✨ Features
- **Enhanced Filament Validation** - Advanced 4-tier profile matching system with exact vs. compatible fallbacks
- **Subtype Support** - Materials like "PLA High Speed", "PETG HF", "Silk", etc. now correctly resolve to exact Bambu Lab profiles
- **Visual Validation Feedback** - Green (exact match) and Yellow (compatible) alerts show profile compatibility at a glance
- **70+ Filament Presets** - Extensive database with temperature ranges for all major materials

### 🔧 Improvements
- **Code Refactoring** - Extracted `temperaturePresets` object to dedicated `presets.js` module for better maintainability
- **Debug Cleanup** - Removed all console.log debug statements for production-ready code
- **Profile Matching Logic** - Fixed Material+Subtype combination lookup with proper fallback hierarchy:
  1. Exact profile name match
  2. Material+Subtype map lookup
  3. Material-only lookup
  4. System default (Generic PETG)
- **Updated Documentation** - Comprehensive README with validation system explanation and file structure

### 🐛 Bug Fixes
- Fixed subtype matching for materials like "PLA High Speed" → correctly resolves to "Generic PLA High Speed" profile
- Fixed compatibility detection for composite materials (CF, GF variants)
- Corrected fallback behavior for unsupported material combinations

### 📄 Documentation
- Updated README.md with v1.1 features and version history
- Added Browser Support table
- Added Known Limitations section
- Expanded Technical Details section

### 📦 File Structure
```
.
├── index.html              # Main application interface (includes presets.js script tag)
├── app.js                  # Application logic, event handling, color picker
├── openspool.js            # OpenSpool format & NFC operations
├── filament-generator.js   # Filament JSON generation & validation (cleaned of debug logs)
├── presets.js              # Temperature presets database (NEW - extracted from app.js)
├── README.md               # Updated documentation
└── CHANGELOG.md            # This file
```

### 🔄 Dependencies
- **presets.js must load before app.js** - Ensures `temperaturePresets` global is available
- Fallback in app.js if presets not loaded: `temperaturePresets || {}`

---

## [1.0] - 2026-01-23

### 🎉 Initial Release

#### Features
- 📝 **NFC Tag Writing** - Write filament information to NFC tags using Web NFC API
- 📷 **Camera Color Picker** - Extract colors directly from filament spools
- 🎨 **Advanced HSV Color Picker** - Full spectrum control with hue, saturation, brightness
- 📱 **Mobile-Optimized** - Touch-friendly interface designed for mobile devices
- 📦 **Filament Presets** - Temperature ranges for common materials

#### Files
- `index.html` - Main application interface
- `app.js` - Color picker and application logic  
- `openspool.js` - OpenSpool format and NFC operations
- `README.md` - Project documentation

#### Supported Platforms
- Chrome/Edge (Android) - Full NFC support
- Firefox (Android) - Partial NFC support
- Desktop browsers - Color picker only
- Safari (iOS) - Color picker only

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

## Supported Materials (v1.0+)

**Base Materials**: PLA, PETG, ABS, ASA, PA, PC, TPU, PVA, BVOH, PP, PEEK, PEI, HIPS

**Composites**: Carbon-Fiber (-CF), Glass-Fiber (-GF) variants

**Specialty**: Wood, Stone, Metal (Copper/Bronze/Brass), Carbon-Graphene

**Variants** (v1.1+): High Speed, Silk Finish, eco variants (ecoPLA, easyPETG)
