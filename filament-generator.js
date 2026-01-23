/**
 * Filament JSON Generator
 * Generates OpenSpool-compatible JSON for 3D printer filaments
 */

const filamentGenerator = {
  // Generic profiles - must exist in slicer
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

  // Material similarity groups - organized by base material and properties
  // Based on temperature ranges and mechanical properties
  materialFamilies: {
    'PLA': {
      tempNozzle: { min: 190, max: 220 },
      tempBed: { min: 50, max: 60 },
      similar: ['ecoPLA', 'PLA High Speed', 'PLA Silk'],
      inherits: 'Generic PLA'
    },
    'ecoPLA': {
      tempNozzle: { min: 190, max: 220 },
      tempBed: { min: 50, max: 60 },
      similar: ['PLA', 'PLA High Speed'],
      inherits: 'Generic PLA'
    },
    'PLA High Speed': {
      tempNozzle: { min: 190, max: 220 },
      tempBed: { min: 50, max: 60 },
      similar: ['PLA', 'ecoPLA'],
      inherits: 'Generic PLA High Speed'
    },
    'PLA Silk': {
      tempNozzle: { min: 190, max: 220 },
      tempBed: { min: 50, max: 60 },
      similar: ['PLA', 'ecoPLA'],
      inherits: 'Generic PLA Silk'
    },
    'PLA-CF': {
      tempNozzle: { min: 200, max: 230 },
      tempBed: { min: 50, max: 70 },
      similar: ['PLA', 'PETG-CF', 'ABS-CF'],
      inherits: 'Generic PLA-CF'
    },
    'PLA-GF': {
      tempNozzle: { min: 200, max: 230 },
      tempBed: { min: 55, max: 70 },
      similar: ['PLA', 'PETG-GF'],
      inherits: 'Generic PLA'
    },
    'PETG': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 70, max: 80 },
      similar: ['easyPETG', 'PCTG', 'PETG HF'],
      inherits: 'Generic PETG'
    },
    'PETG HF': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 70, max: 80 },
      similar: ['PETG', 'easyPETG'],
      inherits: 'Generic PETG HF'
    },
    'easyPETG': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 70, max: 80 },
      similar: ['PETG', 'PCTG'],
      inherits: 'Generic PETG'
    },
    'PCTG': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 70, max: 80 },
      similar: ['PETG', 'easyPETG'],
      inherits: 'Generic PETG'
    },
    'PETG-CF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG', 'ABS-CF', 'PCTG-CF'],
      inherits: 'Generic PETG-CF'
    },
    'PETG-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG', 'PLA-GF'],
      inherits: 'Generic PETG-GF'
    },
    'easyPETG-CF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG-CF', 'PCTG-CF'],
      inherits: 'Generic PETG-CF'
    },
    'easyPETG-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG-GF'],
      inherits: 'Generic PETG-GF'
    },
    'PCTG-CF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG-CF', 'easyPETG-CF'],
      inherits: 'Generic PETG-CF'
    },
    'PCTG-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 75, max: 85 },
      similar: ['PETG-GF'],
      inherits: 'Generic PETG-GF'
    },
    'ABS': {
      tempNozzle: { min: 230, max: 260 },
      tempBed: { min: 90, max: 110 },
      similar: ['ASA', 'ABS-CF'],
      inherits: 'Generic ABS'
    },
    'ABS-CF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 95, max: 115 },
      similar: ['ABS', 'ASA-CF', 'PETG-CF'],
      inherits: 'Generic PA-CF'
    },
    'ABS-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 100, max: 120 },
      similar: ['ABS', 'PA-GF'],
      inherits: 'Generic ABS'
    },
    'ASA': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 90, max: 110 },
      similar: ['ABS', 'ASA-CF'],
      inherits: 'Generic ASA'
    },
    'ASA-CF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 95, max: 115 },
      similar: ['ASA', 'ABS-CF'],
      inherits: 'Generic ASA'
    },
    'ASA-GF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 100, max: 120 },
      similar: ['ASA', 'ABS-GF'],
      inherits: 'Generic ASA'
    },
    'PA': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 70, max: 90 },
      similar: ['PA6', 'PA12', 'PA-CF'],
      inherits: 'Generic PA'
    },
    'PA6': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 70, max: 90 },
      similar: ['PA', 'PA12'],
      inherits: 'Generic PA'
    },
    'PA12': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 70, max: 90 },
      similar: ['PA', 'PA6'],
      inherits: 'Generic PA'
    },
    'PA-CF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 70, max: 90 },
      similar: ['PA', 'PA6-CF', 'ABS-CF'],
      inherits: 'Generic PA-CF'
    },
    'PA6-CF': {
      tempNozzle: { min: 250, max: 290 },
      tempBed: { min: 80, max: 100 },
      similar: ['PA-CF', 'PA12-CF'],
      inherits: 'Generic PA-CF'
    },
    'PA12-CF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 75, max: 95 },
      similar: ['PA-CF', 'PA6-CF'],
      inherits: 'Generic PA-CF'
    },
    'PA-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 80, max: 100 },
      similar: ['PA', 'PA6-GF'],
      inherits: 'Generic PA'
    },
    'PA6-GF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 85, max: 105 },
      similar: ['PA-GF'],
      inherits: 'Generic PA'
    },
    'PA12-GF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 80, max: 100 },
      similar: ['PA-GF', 'PA6-GF'],
      inherits: 'Generic PA'
    },
    'ePAHT-CF': {
      tempNozzle: { min: 260, max: 290 },
      tempBed: { min: 80, max: 100 },
      similar: ['PA-CF', 'PA6-CF'],
      inherits: 'Generic PA-CF'
    },
    'PEBA': {
      tempNozzle: { min: 215, max: 235 },
      tempBed: { min: 40, max: 60 },
      similar: ['PEBA-CF', 'TPU'],
      inherits: 'Generic BVOH'
    },
    'PEBA-CF': {
      tempNozzle: { min: 225, max: 250 },
      tempBed: { min: 50, max: 70 },
      similar: ['PEBA', 'TPU-CF'],
      inherits: 'Generic BVOH'
    },
    'PEBA-GF': {
      tempNozzle: { min: 225, max: 250 },
      tempBed: { min: 50, max: 70 },
      similar: ['PEBA'],
      inherits: 'Generic BVOH'
    },
    'PC': {
      tempNozzle: { min: 270, max: 310 },
      tempBed: { min: 100, max: 120 },
      similar: ['PC-CF'],
      inherits: 'Generic PC'
    },
    'PC-CF': {
      tempNozzle: { min: 280, max: 320 },
      tempBed: { min: 110, max: 130 },
      similar: ['PC'],
      inherits: 'Generic PC'
    },
    'PC-GF': {
      tempNozzle: { min: 270, max: 300 },
      tempBed: { min: 110, max: 130 },
      similar: ['PC'],
      inherits: 'Generic PC'
    },
    'PEEK': {
      tempNozzle: { min: 360, max: 400 },
      tempBed: { min: 120, max: 150 },
      similar: ['PEEK-CF', 'PEI'],
      inherits: 'Generic PC'
    },
    'PEEK-CF': {
      tempNozzle: { min: 370, max: 410 },
      tempBed: { min: 130, max: 160 },
      similar: ['PEEK'],
      inherits: 'Generic PC'
    },
    'PEEK-GF': {
      tempNozzle: { min: 370, max: 410 },
      tempBed: { min: 135, max: 165 },
      similar: ['PEEK'],
      inherits: 'Generic PC'
    },
    'PEI': {
      tempNozzle: { min: 340, max: 380 },
      tempBed: { min: 120, max: 140 },
      similar: ['PEI-CF', 'PEEK'],
      inherits: 'Generic PC'
    },
    'PEI-CF': {
      tempNozzle: { min: 350, max: 390 },
      tempBed: { min: 130, max: 150 },
      similar: ['PEI', 'PEEK-CF'],
      inherits: 'Generic PC'
    },
    'PEI-GF': {
      tempNozzle: { min: 350, max: 390 },
      tempBed: { min: 130, max: 150 },
      similar: ['PEI'],
      inherits: 'Generic PC'
    },
    'HIPS': {
      tempNozzle: { min: 230, max: 250 },
      tempBed: { min: 90, max: 110 },
      similar: ['HIPS-CF', 'ABS'],
      inherits: 'Generic ABS'
    },
    'HIPS-CF': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 95, max: 115 },
      similar: ['HIPS', 'ABS-CF'],
      inherits: 'Generic ABS'
    },
    'PP': {
      tempNozzle: { min: 210, max: 240 },
      tempBed: { min: 40, max: 60 },
      similar: ['PP-CF'],
      inherits: 'Generic BVOH'
    },
    'PP-CF': {
      tempNozzle: { min: 230, max: 260 },
      tempBed: { min: 50, max: 70 },
      similar: ['PP'],
      inherits: 'Generic BVOH'
    },
    'PP-GF': {
      tempNozzle: { min: 230, max: 260 },
      tempBed: { min: 55, max: 75 },
      similar: ['PP'],
      inherits: 'Generic BVOH'
    },
    'PVA': {
      tempNozzle: { min: 190, max: 220 },
      tempBed: { min: 50, max: 60 },
      similar: ['BVOH'],
      inherits: 'Generic PVA'
    },
    'BVOH': {
      tempNozzle: { min: 230, max: 260 },
      tempBed: { min: 60, max: 80 },
      similar: ['PVA'],
      inherits: 'Generic BVOH'
    },
    'TPU': {
      tempNozzle: { min: 210, max: 230 },
      tempBed: { min: 30, max: 60 },
      similar: ['TPU 95A HF', 'TPU-CF', 'TPE'],
      inherits: 'Generic TPU'
    },
    'TPU 95A HF': {
      tempNozzle: { min: 210, max: 230 },
      tempBed: { min: 30, max: 60 },
      similar: ['TPU', 'TPE'],
      inherits: 'Generic TPU 95A HF'
    },
    'TPU-CF': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 40, max: 70 },
      similar: ['TPU', 'TPE-CF'],
      inherits: 'Generic TPU'
    },
    'TPU-GF': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 45, max: 70 },
      similar: ['TPU', 'TPE-GF'],
      inherits: 'Generic TPU'
    },
    'TPE': {
      tempNozzle: { min: 210, max: 235 },
      tempBed: { min: 30, max: 50 },
      similar: ['TPE-CF', 'TPU'],
      inherits: 'Generic TPU'
    },
    'TPE-CF': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 40, max: 60 },
      similar: ['TPE', 'TPU-CF'],
      inherits: 'Generic TPU'
    },
    'TPE-GF': {
      tempNozzle: { min: 220, max: 250 },
      tempBed: { min: 45, max: 65 },
      similar: ['TPE', 'TPU-GF'],
      inherits: 'Generic TPU'
    },
    'Wood': {
      tempNozzle: { min: 190, max: 215 },
      tempBed: { min: 50, max: 65 },
      similar: ['Stone', 'PLA'],
      inherits: 'Generic PLA'
    },
    'Stone': {
      tempNozzle: { min: 190, max: 215 },
      tempBed: { min: 50, max: 65 },
      similar: ['Wood', 'PLA'],
      inherits: 'Generic PLA'
    },
    'Metal-Copper': {
      tempNozzle: { min: 195, max: 225 },
      tempBed: { min: 55, max: 70 },
      similar: ['Metal-Bronze', 'Metal-Brass'],
      inherits: 'Generic PLA'
    },
    'Metal-Bronze': {
      tempNozzle: { min: 200, max: 230 },
      tempBed: { min: 60, max: 75 },
      similar: ['Metal-Copper', 'Metal-Brass'],
      inherits: 'Generic PLA'
    },
    'Metal-Brass': {
      tempNozzle: { min: 200, max: 230 },
      tempBed: { min: 60, max: 75 },
      similar: ['Metal-Copper', 'Metal-Bronze'],
      inherits: 'Generic PLA'
    },
    'Carbon-Graphene': {
      tempNozzle: { min: 240, max: 270 },
      tempBed: { min: 95, max: 115 },
      similar: ['ABS-CF', 'PETG-CF'],
      inherits: 'Generic PA-CF'
    },
    'Nylon-Hydrophobic-CF': {
      tempNozzle: { min: 250, max: 280 },
      tempBed: { min: 80, max: 100 },
      similar: ['PA-CF', 'ePAHT-CF'],
      inherits: 'Generic PA-CF'
    }
  },

  /**
   * Find similar filaments based on material type and temperature compatibility
   * @param {string} material - Material name
   * @param {number} nozzleTemp - Current nozzle temperature (average)
   * @returns {array} Array of similar filament profiles
   */
  findSimilarFilaments(material, nozzleTemp) {
    const materialData = this.materialFamilies[material];
    
    if (!materialData) {
      return [];
    }

    // Get directly similar materials from the family
    const directSimilar = materialData.similar || [];
    
    // Create list of potential matches
    const matches = [];
    
    // Add direct similar materials first (highest priority)
    directSimilar.forEach(sim => {
      const genericName = `Generic ${sim}`;
      if (this.filamentProfiles.includes(genericName)) {
        matches.push(genericName);
      }
    });
    
    // Add temperature-compatible materials as secondary matches
    const tempRange = 15; // +/- degrees for compatibility
    Object.entries(this.materialFamilies).forEach(([key, data]) => {
      if (key === material) return; // Skip self
      if (matches.some(m => m.includes(key))) return; // Already added
      
      // Check if temperature is compatible
      const tempMin = data.tempNozzle.min;
      const tempMax = data.tempNozzle.max;
      
      if (nozzleTemp >= tempMin - tempRange && nozzleTemp <= tempMax + tempRange) {
        const genericName = `Generic ${key}`;
        if (this.filamentProfiles.includes(genericName)) {
          matches.push(genericName);
        }
      }
    });
    
    return matches;
  },

  /**
   * Get inheritance value with validation
   * Falls back to similar filament if exact match not found
   * @param {string} material - Material name
   * @param {number} nozzleTemp - Current nozzle temperature
   * @returns {object} {inherits: string, isValid: boolean, suggestion: string|null, similar: array}
   */
  getValidInherits(material, nozzleTemp) {
    // First check if material exists in families
    if (!this.materialFamilies[material]) {
      // Unknown material - find closest match by temperature
      const closestMatch = this.findSimilarFilaments('PETG', nozzleTemp);
      return {
        inherits: closestMatch[0] || 'Generic PETG',
        isValid: false,
        suggestion: `Material "${material}" not recognized. Using closest match: "${closestMatch[0] || 'Generic PETG'}".`,
        similar: closestMatch
      };
    }

    // Get the inherit preference from material family
    const materialData = this.materialFamilies[material];
    const preferredInherit = materialData.inherits;
    
    // Check if preferred inherit exists
    if (this.filamentProfiles.includes(preferredInherit)) {
      return {
        inherits: preferredInherit,
        isValid: true,
        suggestion: null,
        similar: [preferredInherit]
      };
    }
    
    // Find similar alternatives
    const similar = this.findSimilarFilaments(material, nozzleTemp);
    
    if (similar.length > 0) {
      return {
        inherits: similar[0],
        isValid: false,
        suggestion: `Profile "${preferredInherit}" not found. Using: "${similar[0]}". Similar: ${similar.slice(0, 3).join(', ')}`,
        similar: similar
      };
    }
    
    // Last resort fallback
    return {
      inherits: 'Generic PETG',
      isValid: false,
      suggestion: `Profile "${preferredInherit}" not found. No similar profiles available. Using fallback: "Generic PETG".`,
      similar: ['Generic PETG']
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
    const filamentName = `${brand} ${material}${type ? ' ' + type : ''}`;

    // Get validated inherits value with temperature-based matching
    const inheritData = this.getValidInherits(material, avgNozzle);

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
        suggestion: inheritData.suggestion,
        similar: inheritData.similar
      }
    };
  },

  /**
   * Download a JSON file
   * @param {object} data - JSON data to download
   * @param {string} filename - Name of the file to download
   */
  downloadJsonFile(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
