# Release v1.0.0

**Date:** January 23, 2026  
**Commit:** 4679cf5df3189260e454af7653b31bb5a2bdef3b

## Features

### Color Picker - Full HSV Implementation
- ✅ Hue slider (horizontal rainbow bar)
- ✅ Saturation/Value (S/V) square with proper gradients
  - Left to right: white → full hue color
  - Top to bottom: full brightness → black
- ✅ RGB input fields with live sync
- ✅ HEX color display and input
- ✅ Real-time preview

### Touch Controls
- ✅ Unified mouse + touch event handling
- ✅ **Touch locking mechanism**
  - Lock to S/V square while touching (hue bar blocked)
  - Lock to hue bar while touching (S/V square blocked)
  - Lock released on touch end
- ✅ Smooth, responsive interactions

### Bug Fixes
- ✅ Fixed S/V edge movement resetting hue to red
- ✅ Proper gradient isolation (hue bar doesn't affect S/V movements)
- ✅ No accidental color jumps on borders

## Technical Details

### Color Space
- HSV (Hue-Saturation-Value) model
- Proper RGB ↔ HSV conversions
- CSS linear gradients for visual representation

### Touch State Management
```javascript
touchLock: {
  active: false,
  lockedTo: null  // 'hue' or 'sv'
}
```

### Update Flow
- `updateColorFromHue()` - Updates gradient + RGB when hue changes
- `updateColorFromSV()` - Updates RGB only (preserves gradient)
- `updateColorFromRGB()` - Updates everything including gradient

## Files Modified
- `app.js` - Complete color picker implementation with touch locking

## Known Limitations
- None at this release

## Next Steps
- Performance monitoring on production
- Potential: HSL mode support
- Potential: Color history/favorites
