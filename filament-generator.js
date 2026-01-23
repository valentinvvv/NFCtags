/**
 * Filament JSON Generator
 * Generates OpenSpool-compatible JSON for 3D printer filaments
 */

const filamentGenerator = {
  // Generic profiles - must exist in slicer
  // These are the "Real" profiles that yield a valid (Green) status
  filamentProfiles: [
    'Generic ABS',
    'Generic ASA',
    'Generic BVOH',
    'Generic PA',
    'Generic PA-CF',
    'Generic PC',
    'Generic PETG',
    'Generic PETG HF',
    'Generic PETG-CF',
    'Generic PETG-GF',
    'Generic PLA',
    'Generic PLA High Speed',
    'Generic PLA Silk',
    'Generic PLA-CF',
    'Generic PVA',
    'Generic Support For PLA',
    'Generic TPU',
    'Generic TPU 95A HF'
  ],

  // Material inheritance mapping
  // Maps specific Material+Subtype combos to their closest Generic profile
  materialInheritance: {
    'PLA': 'Generic PLA',
    'ecoPLA': 'Generic PLA',
    'PLA High Speed': 'Generic PLA High Speed',
    'PLA Silk': 'Generic PLA Silk',
    'PLA-CF': 'Generic PLA-CF',
    'PLA-GF': 'Generic PLA',
    'PETG': 'Generic PETG',
    'PETG HF': 'Generic PETG HF',
    'easyPETG': 'Generic PETG',
    'PCTG': 'Generic PETG',
    'PETG-CF': 'Generic PETG-CF',
    'PETG-GF': 'Generic PETG-GF',
    'easyPETG-CF': 'Generic PETG-CF',
    'easyPETG-GF': 'Generic PETG-GF',
    'PCTG-CF': 'Generic PETG-CF',
    'PCTG-GF': 'Generic PETG-GF',
    'ABS': 'Generic ABS',
    'ABS-CF': 'Generic PA-CF',
    'ABS-GF': 'Generic ABS',
    'ASA': 'Generic ASA',
    'ASA-CF': 'Generic ASA',
    'ASA-GF': 'Generic ASA',
    'PA': 'Generic PA',
    'PA6': 'Generic PA',
    'PA12': 'Generic PA',
    'PA-CF': 'Generic PA-CF',
    'PA6-CF': 'Generic PA-CF',
    'PA12-CF': 'Generic PA-CF',
    'PA-GF': 'Generic PA',
    'PA6-GF': 'Generic PA',
    'PA12-GF': 'Generic PA',
    'ePAHT-CF': 'Generic PA-CF',
    'PEBA': 'Generic BVOH',
    'PEBA-CF': 'Generic BVOH',
    'PEBA-GF': 'Generic BVOH',
    'PC': 'Generic PC',
    'PC-CF': 'Generic PC',
    'PC-GF': 'Generic PC',
    'PEEK': 'Generic PC',
    'PEEK-CF': 'Generic PC',
    'PEEK-GF': 'Generic PC',
    'PEI': 'Generic PC',
    'PEI-CF': 'Generic PC',
    'PEI-GF': 'Generic PC',
    'HIPS': 'Generic ABS',
    'HIPS-CF': 'Generic ABS',
    'PP': 'Generic BVOH',
    'PP-CF': 'Generic BVOH',
    'PP-GF': 'Generic BVOH',
    'PVA': 'Generic PVA',
    'BVOH': 'Generic BVOH',
    'TPU': 'Generic TPU',
    'TPU 95A HF': 'Generic TPU 95A HF',
    'TPU-CF': 'Generic TPU',
    'TPU-GF': 'Generic TPU',
    'TPE': 'Generic TPU',
    'TPE-CF': 'Generic TPU',
    'TPE-GF': 'Generic TPU',
    'Wood': 'Generic PLA',
    'Stone': 'Generic PLA',
    'Metal-Copper': 'Generic PLA',
    'Metal-Bronze': 'Generic PLA',
    'Metal-Brass': 'Generic PLA',
    'Carbon-Graphene': 'Generic PA-CF',
    'Nylon-Hydrophobic-CF': 'Generic PA-CF'
  },

  /**
   * Get inheritance value with validation
   * Logic:
   * 1. Try Exact Match (Generic Material Subtype) in filamentProfiles -> Valid
   * 2. Try Inheritance Map (Material Subtype) -> Similar (Warning)
   * 3. Try Inheritance Map (Material) -> Similar (Warning)
   * 4. Fallback -> Generic PETG (Warning)
   * 
   * @param {string} material - Material name (e.g. "PLA")
   * @param {string} subtype - Subtype name (e.g. "High Speed", "Silk", "Basic")
   * @returns {object} {inherits: string, isValid: boolean, suggestion: string|null}
   */
  getValidInherits(material, subtype) {
    // Clean subtype (Basic implies empty)
    const cleanSubtype = (subtype && subtype !== 'Basic') ? subtype.trim() : '';
    
    // 1. Construct potential Exact Profile Name
    const exactProfileName = cleanSubtype 
      ? `Generic ${material} ${cleanSubtype}`
      : `Generic ${material}`;

    // CHECK 1: Is this a Real Profile? (Green)
    if (this.filamentProfiles.includes(exactProfileName)) {
      return {
        inherits: exactProfileName,
        isValid: true,
        suggestion: null
      };
    }

    // If not an exact match, we look for a "Similar" profile (Yellow)
    let similarProfile = null;
    let lookupKeyFull = cleanSubtype ? `${material} ${cleanSubtype}` : material;

    // CHECK 2: Lookup via Material + Subtype
    if (this.materialInheritance[lookupKeyFull]) {
      similarProfile = this.materialInheritance[lookupKeyFull];
    } 
    // CHECK 3: Lookup via Material only
    else if (this.materialInheritance[material]) {
      similarProfile = this.materialInheritance[material];
    }

    // Validate the similar profile exists in our real profiles list
    if (similarProfile && this.filamentProfiles.includes(similarProfile)) {
      // CRITICAL: Ensure we flag this as INVALID (Yellow) because it's not an exact match
      // Even if similarProfile is a valid profile, it's not the EXACT profile requested.
      return {
        inherits: similarProfile,
        isValid: false, 
        suggestion: `Exact profile "${exactProfileName}" not found. Using compatible: "${similarProfile}".`
      };
    }

    // CHECK 4: Fallback (Yellow/Red)
    return {
      inherits: 'Generic PETG',
      isValid: false,
      suggestion: `No compatible profile found for "${lookupKeyFull}". Defaulting to: "Generic PETG".`
    };
  },

  /**
   * Generate JSON from form data with validation
   * @param {object} formData - Data from the form
   * @returns {object} OpenSpool JSON object with validation info
   */
  generateFromFormData(formData) {
    const material = formData.material || 'PETG';
    const brand = formData.brand || 'Generic';
    const type = formData.type || 'Basic';
    
    const minNozzle = parseInt(formData.minNozzle) || 210;
    const maxNozzle = parseInt(formData.maxNozzle) || 230;
    const minBed = parseInt(formData.minBed) || 60;
    const maxBed = parseInt(formData.maxBed) || 70;

    // Calculate average temperatures
    const avgNozzle = Math.round((minNozzle + maxNozzle) / 2);
    const avgBed = Math.round((minBed + maxBed) / 2);

    // Build filament name
    const filamentName = `${brand} ${material} ${type}`;

    // Get validated inherits value using Material AND Type
    const inheritData = this.getValidInherits(material, type);

    return {
      json: {
        filament_settings_id: [filamentName],
        filament_vendor: [brand],
        from: 'User',
        inherits: inheritData.inherits,
        is_custom_defined: '0',
        name: filamentName,
        nozzle_temperature: [avgNozzle.toString()],
        nozzle_temperature_initial_layer: [(avgNozzle).toString()],
        textured_plate_temp: [avgBed.toString()],
        textured_plate_temp_initial_layer: [(avgBed).toString()],
        version: '2.2.42.2'
      },
      validation: {
        isValid: inheritData.isValid,
        suggestion: inheritData.suggestion
      }
    };
  },

  /**
   * Download a JSON file - Robust implementation
   * @param {object} data - JSON data to download
   * @param {string} filename - Name of the file to download (should include .json extension)
   */
  downloadJsonFile(data, filename) {
    try {
      // Validate inputs
      if (!data) {
        console.error('downloadJsonFile: No data provided');
        return false;
      }
      
      if (!filename || typeof filename !== 'string') {
        console.error('downloadJsonFile: Invalid filename');
        return false;
      }

      // Ensure filename has .json extension
      const cleanFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
      
      // Convert data to JSON string with formatting
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create Blob with JSON content
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      
      // Create temporary download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Configure link element
      link.setAttribute('href', url);
      link.setAttribute('download', cleanFilename);
      link.style.visibility = 'hidden';
      
      // Append to document, trigger click, and remove
      try {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        // Clean up URL object reference
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
      
      return true;
    } catch (error) {
      console.error('downloadJsonFile error:', error);
      return false;
    }
  }
};
