/**
 * OpenSpool Format Handler - Simplified
 * Single JSON-based format for 3D printing filament tags
 */

const OpenSpool = {
  /**
   * Generate OpenSpool JSON data for NFC tags
   * @param {Object} formData - Form field values
   * @returns {Object} OpenSpool data structure
   */
  generateData(formData) {
    const data = {
      protocol: "openspool",
      version: "1.0",
      type: formData.material || formData.materialType || 'PETG',
      color_hex: (formData.colorHex || formData.color_hex || '#FFFFFF').replace('#', '').toUpperCase()
    };

    // Add optional fields - convert to strings for NFC compatibility
    if (formData.brand) data.brand = formData.brand;
    if (formData.subtype || formData.type) data.subtype = formData.subtype || formData.type;
    
    // Temperature fields - convert to strings
    if (formData.minNozzle !== undefined) data.min_temp = String(parseInt(formData.minNozzle) || 220);
    else if (formData.minTemp !== undefined) data.min_temp = String(parseInt(formData.minTemp) || 220);
    
    if (formData.maxNozzle !== undefined) data.max_temp = String(parseInt(formData.maxNozzle) || 240);
    else if (formData.maxTemp !== undefined) data.max_temp = String(parseInt(formData.maxTemp) || 240);
    
    if (formData.minBed !== undefined) data.bed_min_temp = String(parseInt(formData.minBed) || 50);
    else if (formData.bedTempMin !== undefined) data.bed_min_temp = String(parseInt(formData.bedTempMin) || 50);
    
    if (formData.maxBed !== undefined) data.bed_max_temp = String(parseInt(formData.maxBed) || 60);
    else if (formData.bedTempMax !== undefined) data.bed_max_temp = String(parseInt(formData.bedTempMax) || 60);

    return data;
  },

  /**
   * Parse OpenSpool JSON data back to form values
   * @param {Object} jsonData - OpenSpool JSON object
   * @returns {Object} Form field values
   */
  parseData(jsonData) {
    if (jsonData.protocol !== "openspool") {
      throw new Error("Not an OpenSpool format");
    }

    return {
      materialType: jsonData.type || 'PLA',
      colorHex: app.normalizeHexColor(jsonData.color_hex ? '#' + jsonData.color_hex : '#FFFFFF'),
      brand: jsonData.brand || 'Generic',
      subtype: jsonData.subtype || 'Basic',
      minTemp: String(jsonData.min_temp || '220'),
      maxTemp: String(jsonData.max_temp || '240'),
      bedTempMin: String(jsonData.bed_min_temp || ''),
      bedTempMax: String(jsonData.bed_max_temp || '')
    };
  },

  /**
   * Create NDEF record for NFC writing
   * Uses browser's NDEFReader format (MIME type application/json)
   * @param {Object} data - OpenSpool data object
   * @returns {Array} NDEF record array
   */
  createNDEFRecord(data) {
    const jsonStr = JSON.stringify(data);
    const encoder = new TextEncoder();

    return [{
      recordType: "mime",
      mediaType: "application/json",
      data: encoder.encode(jsonStr)
    }];
  },

  /**
   * Parse NDEF record from NFC reading
   * @param {Object} record - NDEF record from NDEFReader
   * @returns {Object|null} Parsed form data or null if not OpenSpool
   */
  parseNDEFRecord(record) {
  if (record.recordType !== "mime" || record.mediaType !== "application/json") {
    return null;
  }

  const decoder = new TextDecoder("utf-8");
  let text;

  try {
    text = decoder.decode(record.data);
  } catch (e) {
    console.error("Error decoding NDEF record data:", e);
    return null;
  }

  try {
    const jsonData = JSON.parse(text);

    if (jsonData && jsonData.protocol === "openspool") {
      return this.parseData(jsonData);
    }
  } catch (e) {
    console.error("Error parsing OpenSpool record JSON:", e);
  }

  return null;
},

  /**
   * Calculate the size needed for NDEF encoding
   * Accepts either form data or OpenSpool data object
   * @param {Object} dataOrForm - Form data or OpenSpool data object
   * @returns {number} Size in bytes
   */
  calculateRecordSize(dataOrForm) {
    // If input looks like form data (has minNozzle/minTemp), generate OpenSpool data first
    let data = dataOrForm;
    
    if (dataOrForm.minNozzle !== undefined || dataOrForm.minTemp !== undefined) {
      try {
        data = this.generateData(dataOrForm);
      } catch (e) {
        console.error('Error generating data in calculateRecordSize:', e);
        return 0;
      }
    }

    try {
      const jsonStr = JSON.stringify(data);
      const encoder = new TextEncoder();
      const payload = encoder.encode(jsonStr);

      // NDEF record structure:
      // 1 byte: header
      // 1 byte: type length (16 = "application/json")
      // 1 byte: payload length (short form, <256 bytes)
      // 16 bytes: media type "application/json"
      // N bytes: payload

      const mediaType = "application/json";
      const headerSize = 3; // header + type_length + payload_length (short form)
      const mediaTypeLength = mediaType.length;
      const payloadLength = payload.byteLength;

      return headerSize + mediaTypeLength + payloadLength;
    } catch (e) {
      console.error('Error calculating record size:', e);
      return 0;
    }
  }
};
