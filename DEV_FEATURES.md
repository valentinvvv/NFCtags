# NFCtags Development Branch (dev)

## ✨ New Features - Live JSON Preview & Download

### 📋 JSON Preview in Create Tag Mode

When creating or updating a tag, you now get a **live JSON preview** on the right side of the form.

**Features:**
- Real-time updates as you change any field
- Shows complete OpenSpool JSON format
- Perfect for copying to clipboard or reviewing before download

### 📥 Download JSON File

Directly download the generated JSON profile from the form:

1. Fill in the filament details
2. View the JSON preview on the right
3. Click **"📋 Copy JSON"** to copy to clipboard
4. Click **"📥 Download JSON"** to save as `.json` file

### 🌡️ Automatic Temperature Calculation

JSON automatically generates temperatures using **averages** of your min/max ranges:

**Example:**
- Min Nozzle: 240°C
- Max Nozzle: 250°C
- Generated: 245°C ← (240+250)/2
- Initial Layer: 240°C ← 245-5

**Same for bed temperature:**
- Min Bed: 81°C
- Max Bed: 82°C
- Generated: 81°C ← (81+82)/2
- Initial Layer: 80°C ← 81-1

### 📊 Form Integration

The JSON preview updates **automatically** whenever you change:
- Material Type
- Brand Name
- Sub Type (Basic, Silk, etc.)
- Min/Max Nozzle Temperature
- Min/Max Bed Temperature

## 🔧 Technical Implementation

### Files Modified

1. **`index.html`** ✏️
   - Added JSON preview section on the right side of form
   - Copy JSON button
   - Download JSON button
   - Integrated into Create New Tag section

2. **`filament-generator.js`** ✏️
   - Added `generateFromFormData()` method
   - Generates OpenSpool JSON from form inputs
   - Calculates average temperatures automatically
   - Maps material types to correct inheritance values

3. **`app.js`** ✏️
   - Added `updateJsonPreview()` method
   - Added `copyJsonToClipboard()` method
   - Added `downloadJsonFile()` method
   - Form fields trigger live preview updates
   - Event listeners for all temperature/material fields

### Data Flow

```
Form Inputs
    ↓
[Material, Brand, Temps, Bed Temps]
    ↓
filamentGenerator.generateFromFormData()
    ↓
Calculate averages
Map inherits value
Format as OpenSpool JSON
    ↓
Display in preview box
Enable copy/download buttons
    ↓
User can:
- Copy to clipboard
- Download as .json file
- Write to NFC tag
```

### Generated JSON Structure

```json
{
  "filament_settings_id": ["Brand Material Type"],
  "filament_vendor": ["Brand"],
  "from": "User",
  "inherits": "Generic PETG",
  "is_custom_defined": "0",
  "name": "Brand Material Type",
  "nozzle_temperature": ["245"],
  "nozzle_temperature_initial_layer": ["240"],
  "textured_plate_temp": ["81"],
  "textured_plate_temp_initial_layer": ["80"],
  "version": "2.2.42.2"
}
```

## 🎯 Use Cases

### 1. Create Custom Filament Profile
1. Enter material details in form
2. Check JSON preview
3. Click "Copy JSON"
4. Paste into your slicer settings
5. Customize further as needed

### 2. Download for Distribution
1. Fill in all filament details
2. Click "Download JSON"
3. Share `.json` file with team/users
4. They can import into their slicers

### 3. Quick Verification
1. Want to check temperature calculation?
2. Look at JSON preview instantly
3. See exact values being stored

## 🔄 Compatibility

- ✅ OpenSpool format v2.2.42.2
- ✅ PrusaSlicer compatible
- ✅ Cura compatible
- ✅ Bambu Studio compatible
- ✅ Custom firmware slicers

## 📝 Example Workflow

**Creality PETG Basic Profile:**

1. **Form Input:**
   - Material: PETG
   - Brand: Creality
   - Type: Basic
   - Min Nozzle: 240°C
   - Max Nozzle: 250°C
   - Min Bed: 81°C
   - Max Bed: 82°C

2. **Live Preview Shows:**
   ```json
   {
     "name": "Creality PETG Basic",
     "inherits": "Generic PETG",
     "nozzle_temperature": ["245"],
     "textured_plate_temp": ["81"]
   }
   ```

3. **Download as:** `creality_petg_basic.json`

## 🚀 Future Enhancements

- [ ] Save custom profiles locally
- [ ] Import JSON profiles back into form
- [ ] Batch download multiple profiles
- [ ] QR code generation for JSON
- [ ] Profile versioning
- [ ] Share profiles via URL
- [ ] Community profile library

## 🐛 Testing

1. **Test live preview:**
   - Change material → preview updates
   - Change temperature → preview updates
   - Change brand → name updates in preview

2. **Test copy to clipboard:**
   - Click copy button
   - Check clipboard content
   - Should be valid JSON

3. **Test download:**
   - Click download button
   - Check downloaded file
   - Should be valid JSON
   - Filename should match filament name

## 📚 References

- [OpenSpool Format](https://openspool.io/rfid.html)
- [OpenPrintTag Spec](https://specs.openprinttag.org/)

---

**Branch:** `dev`
**Status:** In Development
**Last Updated:** 2026-01-23
