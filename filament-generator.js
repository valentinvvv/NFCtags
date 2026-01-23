/**
 * Filament JSON Generator
 * Generates OpenSpool-compatible JSON for 3D printer filaments
 */

const filamentGenerator = {
  // Temperature ranges for each filament type (min, max for nozzle and bed)
  filamentProfiles: {
    // Generic Profiles
    'Generic ABS': {
      inherits: 'Generic ABS',
      vendor: 'Generic',
      minNozzle: 230, maxNozzle: 260,
      minBed: 90, maxBed: 110,
      colorHex: 'FFFFFF'
    },
    'Generic ASA': {
      inherits: 'Generic ASA',
      vendor: 'Generic',
      minNozzle: 240, maxNozzle: 270,
      minBed: 90, maxBed: 110,
      colorHex: 'FFFFFF'
    },
    'Generic BVOH': {
      inherits: 'Generic BVOH',
      vendor: 'Generic',
      minNozzle: 230, maxNozzle: 260,
      minBed: 60, maxBed: 80,
      colorHex: 'FFFFFF'
    },
    'Generic PA': {
      inherits: 'Generic PA',
      vendor: 'Generic',
      minNozzle: 240, maxNozzle: 270,
      minBed: 70, maxBed: 90,
      colorHex: 'FFFFFF'
    },
    'Generic PA-CF': {
      inherits: 'Generic PA-CF',
      vendor: 'Generic',
      minNozzle: 250, maxNozzle: 280,
      minBed: 70, maxBed: 90,
      colorHex: 'FFFFFF'
    },
    'Generic PC': {
      inherits: 'Generic PC',
      vendor: 'Generic',
      minNozzle: 270, maxNozzle: 310,
      minBed: 100, maxBed: 120,
      colorHex: 'FFFFFF'
    },
    'Generic PETG': {
      inherits: 'Generic PETG',
      vendor: 'Generic',
      minNozzle: 220, maxNozzle: 250,
      minBed: 70, maxBed: 80,
      colorHex: 'FFFFFF'
    },
    'Generic PETG HF': {
      inherits: 'Generic PETG HF',
      vendor: 'Generic',
      minNozzle: 220, maxNozzle: 250,
      minBed: 70, maxBed: 80,
      colorHex: 'FFFFFF'
    },
    'Generic PETG-CF': {
      inherits: 'Generic PETG-CF',
      vendor: 'Generic',
      minNozzle: 240, maxNozzle: 270,
      minBed: 75, maxBed: 85,
      colorHex: 'FFFFFF'
    },
    'Generic PETG-GF': {
      inherits: 'Generic PETG-GF',
      vendor: 'Generic',
      minNozzle: 240, maxNozzle: 270,
      minBed: 75, maxBed: 85,
      colorHex: 'FFFFFF'
    },
    'Generic PLA': {
      inherits: 'Generic PLA',
      vendor: 'Generic',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic PLA High Speed': {
      inherits: 'Generic PLA High Speed',
      vendor: 'Generic',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic PLA Silk': {
      inherits: 'Generic PLA Silk',
      vendor: 'Generic',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic PLA-CF': {
      inherits: 'Generic PLA-CF',
      vendor: 'Generic',
      minNozzle: 200, maxNozzle: 230,
      minBed: 50, maxBed: 70,
      colorHex: 'FFFFFF'
    },
    'Generic PVA': {
      inherits: 'Generic PVA',
      vendor: 'Generic',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic Support For PLA': {
      inherits: 'Generic PLA',
      vendor: 'Generic',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic TPU': {
      inherits: 'Generic TPU',
      vendor: 'Generic',
      minNozzle: 210, maxNozzle: 230,
      minBed: 30, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    'Generic TPU 95A HF': {
      inherits: 'Generic TPU 95A HF',
      vendor: 'Generic',
      minNozzle: 210, maxNozzle: 230,
      minBed: 30, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    // Snapmaker Profiles
    'Snapmaker PETG HF': {
      inherits: 'Generic PETG HF',
      vendor: 'Snapmaker',
      minNozzle: 220, maxNozzle: 250,
      minBed: 70, maxBed: 80,
      colorHex: 'FFFFFF'
    },
    'Snapmaker PLA Basic': {
      inherits: 'Generic PLA',
      vendor: 'Snapmaker',
      minNozzle: 190, maxNozzle: 220,
      minBed: 50, maxBed: 60,
      colorHex: 'FFFFFF'
    },
    // Creality Profiles
    'Creality PETG Basic': {
      inherits: 'Generic PETG',
      vendor: 'Creality',
      minNozzle: 240, maxNozzle: 250,
      minBed: 81, maxBed: 82,
      colorHex: 'FFFFFF'
    }
  },

  /**
   * Generate JSON for a specific filament
   * @param {string} filamentName - Name of the filament profile
   * @param {string} colorHex - Color hex code (without #)
   * @param {number} minNozzle - Minimum nozzle temperature
   * @param {number} maxNozzle - Maximum nozzle temperature
   * @param {number} minBed - Minimum bed temperature
   * @param {number} maxBed - Maximum bed temperature
   * @returns {object} OpenSpool JSON object
   */
  generateJSON(filamentName, colorHex = 'FFFFFF', minNozzle, maxNozzle, minBed, maxBed) {
    const profile = this.filamentProfiles[filamentName];
    if (!profile) {
      console.error(`Profile not found: ${filamentName}`);
      return null;
    }

    // Calculate average temperatures for QR code generation
    const avgNozzle = Math.round((minNozzle + maxNozzle) / 2);
    const avgBed = Math.round((minBed + maxBed) / 2);

    return {
      filament_settings_id: [filamentName],
      filament_vendor: [profile.vendor],
      from: 'Generator',
      inherits: profile.inherits,
      is_custom_defined: '0',
      name: filamentName,
      nozzle_temperature: [avgNozzle.toString()],
      nozzle_temperature_initial_layer: [(avgNozzle - 5).toString()],
      textured_plate_temp: [avgBed.toString()],
      textured_plate_temp_initial_layer: [(avgBed - 1).toString()],
      version: '2.2.42.2'
    };
  },

  /**
   * Generate all filament JSONs
   * @returns {array} Array of all filament JSON objects
   */
  generateAllFilaments() {
    const filaments = [];
    for (const [name, profile] of Object.entries(this.filamentProfiles)) {
      const avgNozzle = Math.round((profile.minNozzle + profile.maxNozzle) / 2);
      const avgBed = Math.round((profile.minBed + profile.maxBed) / 2);

      filaments.push({
        filament_settings_id: [name],
        filament_vendor: [profile.vendor],
        from: 'Generator',
        inherits: profile.inherits,
        is_custom_defined: '0',
        name: name,
        nozzle_temperature: [avgNozzle.toString()],
        nozzle_temperature_initial_layer: [(avgNozzle - 5).toString()],
        textured_plate_temp: [avgBed.toString()],
        textured_plate_temp_initial_layer: [(avgBed - 1).toString()],
        version: '2.2.42.2'
      });
    }
    return filaments;
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
  },

  /**
   * Get list of available filaments
   * @returns {array} Array of filament names
   */
  getAvailableFilaments() {
    return Object.keys(this.filamentProfiles).sort();
  },

  /**
   * Get profile for a filament
   * @param {string} filamentName - Name of the filament
   * @returns {object} Profile object
   */
  getProfile(filamentName) {
    return this.filamentProfiles[filamentName];
  }
};
