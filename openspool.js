/**
 * OpenSpool Format Handler - Simplified
 * Single JSON-based format for 3D printing filament tags
 */

const OpenSpool = {
  /**
   * Generate OpenSpool JSON data
   * @param {Object} formData - Form field values
   * @returns {Object} OpenSpool data structure
   */
  generateData(formData) {
    const data = {
      protocol: "openspool",
      version: "1.0",
      type: formData.materialType,
      color_hex: formData.colorHex.replace('#', '').toUpperCase()
    };

    // Add optional fields only if provided
    if (formData.brand) data.brand = formData.brand;
    if (formData.subtype) data.subtype = formData.subtype;
    if (formData.minTemp) data.min_temp = parseInt(formData.minTemp);
    if (formData.maxTemp) data.max_temp = parseInt(formData.maxTemp);
    if (formData.bedTempMin) data.bed_min_temp = parseInt(formData.bedTempMin);
    if (formData.bedTempMax) data.bed_max_temp = parseInt(formData.bedTempMax);

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
   * Download OpenSpool data as JSON file
   * @param {Object} data - OpenSpool data object
   * @param {string} filename - Output filename
   */
  downloadNFCJSON(data, filename = 'openspool.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse OpenSpool from JSON text or buffer
   * @param {string|ArrayBuffer} buffer - JSON text or binary data
   * @returns {Object|null} Parsed form data or null on error
   */
  readFromBuffer(buffer) {
    try {
      const text = typeof buffer === 'string' 
        ? buffer 
        : new TextDecoder().decode(buffer);
      
      const jsonData = JSON.parse(text);
      return this.parseData(jsonData);
    } catch (e) {
      console.error('Error reading OpenSpool JSON:', e);
      return null;
    }
  },

  /**
   * Calculate the size needed for NDEF encoding
   * @param {Object} data - OpenSpool data object
   * @returns {number} Size in bytes
   */
  calculateRecordSize(data) {
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
  }
};
