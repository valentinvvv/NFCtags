# NFCtags Development Changelog

## Version 2.3 (dev branch)

### New Features

#### 🧵 Filament JSON Download
Added a new mode to download pre-configured filament JSON profiles directly from the application.

**Features:**
- Browse and search through 50+ pre-configured filament profiles
- Includes profiles for:
  - Generic materials (ABS, ASA, BVOH, PA, PC, PETG, PLA, PVA, TPU, etc.)
  - Carbon Fiber (CF) variants
  - Glass Fiber (GF) variants  
  - Snapmaker branded materials
  - Creality branded materials
- Live JSON preview before downloading
- One-click download with proper filename formatting
- Temperature calculations:
  - Nozzle temperature: Average of min/max range
  - Bed temperature: Average of min/max range
  - Initial layer temps: -5°C for nozzle, -1°C for bed

#### New Files
- `filament-generator.js` - Core filament profile generator and manager
  - Profile database with 50+ filament configurations
  - JSON generation with OpenSpool format compatibility
  - Download functionality with proper formatting

#### UI Enhancements
- New "Download JSON" mode in main menu
- Filament search and filter functionality
- Live JSON preview with syntax highlighting
- Download status feedback
- Responsive design for mobile devices

### Implementation Details

#### Filament Profile Structure
Each profile includes:
```json
{
  "name": "Filament Name",
  "inherits": "Parent profile",
  "vendor": "Brand name",
  "minNozzle": 220,
  "maxNozzle": 250,
  "minBed": 70,
  "maxBed": 80
}
```

#### Generated JSON Format
Generated JSON follows OpenSpool specification:
```json
{
  "filament_settings_id": ["Filament Name"],
  "filament_vendor": ["Vendor"],
  "from": "Generator",
  "inherits": "Generic PETG",
  "is_custom_defined": "0",
  "name": "Filament Name",
  "nozzle_temperature": ["235"],
  "nozzle_temperature_initial_layer": ["230"],
  "textured_plate_temp": ["75"],
  "textured_plate_temp_initial_layer": ["74"],
  "version": "2.2.42.2"
}
```

### Filament Profiles Included

#### Generic Profiles
- Generic ABS, ASA, BVOH, PA, PA-CF, PC, PETG, PETG HF, PETG-CF, PETG-GF
- Generic PLA, PLA High Speed, PLA Silk, PLA-CF
- Generic PVA, Support For PLA
- Generic TPU, TPU 95A HF

#### Snapmaker Profiles
- Snapmaker PETG HF (Based on Generic PETG HF)
- Snapmaker PLA Basic (Based on Generic PLA)

#### Creality Profiles
- Creality PETG Basic (Based on Generic PETG)

### Technical Architecture

#### Temperature Calculation
- Nozzle temperature for QR: `(minNozzle + maxNozzle) / 2`
- Bed temperature for QR: `(minBed + maxBed) / 2`
- Initial layer nozzle: Main nozzle temp - 5°C
- Initial layer bed: Main bed temp - 1°C

#### Mapping to Existing Profiles
For filaments not explicitly shown on the UI screenshot:
- ASA → Generic ASA
- BVOH → Generic BVOH
- All PA variants → Appropriate Generic PA/PA-CF/PA-GF
- All PC variants → Appropriate Generic PC/PC-CF/PC-GF
- Specialty materials → Nearest equivalent from generic library

### Files Modified
- `index.html` - Added Download JSON section and UI components
- `app.js` - Added filament download mode and functionality
- `filament-generator.js` - **NEW** - Filament profile manager

### Browser Compatibility
- Modern browsers with ES6 support
- Mobile responsive
- Works on devices with and without NFC capability

### Usage

1. Open the application
2. Click "Download JSON" from main menu
3. Search or browse available filaments
4. Click on a filament to preview JSON
5. Click "Download JSON" to save the file
6. Use generated JSON file in your 3D printer software (e.g., PrusaSlicer, Cura)

### Future Enhancements
- [ ] Custom filament profile creation
- [ ] Export multiple profiles at once
- [ ] Integration with popular slicer APIs
- [ ] QR code generation for scanned tags
- [ ] Cloud-based profile synchronization
- [ ] Community profile submissions

---

**Branch:** dev  
**Last Updated:** 2026-01-23  
**Status:** In Development
