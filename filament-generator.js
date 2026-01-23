/**
 * Filament JSON Generator
 * Generates OpenSpool-compatible JSON for 3D printer filaments
 */

const filamentGenerator = {
  // Temperature ranges for each filament type (min, max for nozzle and bed)
  filamentProfiles: (
    // Generic Profiles
    'Generic ABS',
    'Generic ASA',
    'Generic BVOH', 'Generic PA',
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
  ),

  /**
   * Generate JSON from form data
   * @param {object} formData - Data from the form
   * @returns {object} OpenSpool JSON object
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

    // Get inherits value based on material
    let inheritsValue = `Generic ${material}`;
    if (this.filamentProfiles[filamentName]) {
      inheritsValue = this.filamentProfiles[filamentName].inherits;
    }

    return {
      filament_settings_id: [filamentName],
      filament_vendor: [brand],
      from: 'User',
      inherits: inheritsValue,
      is_custom_defined: '0',
      name: filamentName,
      nozzle_temperature: [avgNozzle.toString()],
      nozzle_temperature_initial_layer: [(avgNozzle).toString()],
      textured_plate_temp: [avgBed.toString()],
      textured_plate_temp_initial_layer: [(avgBed).toString()],
      version: '2.2.42.2'
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