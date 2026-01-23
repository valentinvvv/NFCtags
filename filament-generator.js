/**
 * Filament JSON Generator
 * Generates OpenSpool-compatible JSON for 3D printer filaments
 */

const filamentGenerator = {
  // Temperature ranges for each filament type (min, max for nozzle and bed)
  filamentProfiles: [
    // Generic Profiles
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

  /**
   * Find similar filament profiles based on material type
   * @param {string} material - Material name (e.g., "PETG", "PLA-CF")
   * @returns {array} Array of similar filament profiles
   */
  findSimilarFilaments(material) {
    const material_normalized = material.toLowerCase().replace(/\s+/g, ' ');
    
    return this.filamentProfiles.filter(profile => {
      const profile_normalized = profile.toLowerCase();
      
      // Extract base material (e.g., "PETG" from "Generic PETG-CF")
      const baseMaterial = material_normalized.split('-')[0].split('_')[0].trim();
      
      return profile_normalized.includes(baseMaterial);
    });
  },

  /**
   * Get inheritance value with validation
   * Falls back to similar filament if exact match not found
   * @param {string} material - Material name
   * @returns {object} {inherits: string, isValid: boolean, suggestion: string|null}
   */
  getValidInherits(material) {
    const genericName = `Generic ${material}`;
    
    // Check if exact match exists
    if (this.filamentProfiles.includes(genericName)) {
      return {
        inherits: genericName,
        isValid: true,
        suggestion: null
      };
    }
    
    // Try to find similar filaments
    const similar = this.findSimilarFilaments(material);
    
    if (similar.length > 0) {
      // Return the first similar match
      return {
        inherits: similar[0],
        isValid: false,
        suggestion: `"${genericName}" not found. Using similar profile: "${similar[0]}". Available similar: ${similar.join(', ')}`
      };
    }
    
    // Fallback to Generic PLA if nothing matches
    return {
      inherits: 'Generic PLA',
      isValid: false,
      suggestion: `"${genericName}" not found. No similar profiles available. Using fallback: "Generic PLA"`
    };
  },

  /**
   * Generate JSON from form data with validation
   * @param {object} formData - Data from the form
   * @returns {object} OpenSpool JSON object with validation info
   */
  generateFromFormData(formData) {
    const material = formData.material || 'Generic PLA';
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

    // Get validated inherits value
    const inheritData = this.getValidInherits(material);

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
   * Download a JSON file
   * @param {object} data - JSON data to download
   * @param {string} filename - Name of the file to download
   */
  downloadJSON(data, filename) {
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