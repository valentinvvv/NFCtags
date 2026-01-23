/**
 * NFC Filament Spool Tag Manager - Simplified for OpenSpool Only
 * Manages reading/writing OpenSpool format tags via NFC
 */

// ============================================================================
// NFC READER MODULE
// ============================================================================

const nfcReader = {
  controller: null,
  reader: null,

  async start(onRead, onError) {
    if (this.controller) return; // Already scanning

    try {
      this.controller = new AbortController();
      this.reader = new NDEFReader();
      await this.reader.scan({ signal: this.controller.signal });

      this.reader.addEventListener('reading', ({ message }) => {
        // Process all records in the message
        for (const record of message.records) {
          const formData = OpenSpool.parseNDEFRecord(record);
          if (formData) {
            onRead(formData);
            return;
          }
        }
        onError('No OpenSpool data found on tag');
      });

      this.reader.addEventListener('readingerror', () => {
        onError('Error reading NFC tag');
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError(error.message);
      }
      this.controller = null;
      this.reader = null;
    }
  },

  stop() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
      this.reader = null;
    }
  },

  isScanning() {
    return this.controller !== null;
  }
};

// ============================================================================
// NFC WRITER MODULE
// ============================================================================

const nfcWriter = {
  controller: null,

  async write(records, onProgress) {
    if (this.controller) {
      throw new Error('Write operation already in progress');
    }

    const writer = new NDEFReader();
    this.controller = new AbortController();

    try {
      if (onProgress) onProgress('writing');
      await writer.write({ records, signal: this.controller.signal });
      if (onProgress) onProgress('success');
      this.controller = null;
      return true;
    } catch (error) {
      this.controller = null;
      if (onProgress) onProgress('error', error);
      throw error;
    }
  },

  cancel() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  },

  isWriting() {
    return this.controller !== null;
  }
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

const app = {
  nfcSupported: false,

  // Color palette for quick selection
  colors: [
    '#FFFFFF', '#fff144', '#DCF478', '#0ACC38', '#057748',
    '#0d6284', '#0EE2A0', '#76D9F4', '#46a8f9', '#2850E0',
    '#443089', '#A03CF7', '#F330F9', '#D4B1DD', '#f95d73',
    '#f72323', '#7c4b00', '#f98c36', '#fcecd6', '#D3C5A3',
    '#AF7933', '#898989', '#BCBCBC', '#161616'
  ],

  // Temperature presets for materials
  temperaturePresets: {
    'PLA': { minTemp: 190, maxTemp: 220, bedTempMin: 50, bedTempMax: 60 },
    'ecoPLA': { minTemp: 190, maxTemp: 220, bedTempMin: 50, bedTempMax: 60 },
    'PETG': { minTemp: 220, maxTemp: 250, bedTempMin: 70, bedTempMax: 80 },
    'easyPETG': { minTemp: 220, maxTemp: 250, bedTempMin: 70, bedTempMax: 80 },
    'PCTG': { minTemp: 220, maxTemp: 250, bedTempMin: 70, bedTempMax: 80 },
    'ABS': { minTemp: 230, maxTemp: 260, bedTempMin: 90, bedTempMax: 110 },
    'ASA': { minTemp: 240, maxTemp: 270, bedTempMin: 90, bedTempMax: 110 },
    'TPU': { minTemp: 210, maxTemp: 230, bedTempMin: 30, bedTempMax: 60 },
    'TPE': { minTemp: 210, maxTemp: 235, bedTempMin: 30, bedTempMax: 50 },
    'PA': { minTemp: 240, maxTemp: 270, bedTempMin: 70, bedTempMax: 90 },
    'PA6': { minTemp: 240, maxTemp: 270, bedTempMin: 70, bedTempMax: 90 },
    'PA12': { minTemp: 240, maxTemp: 270, bedTempMin: 70, bedTempMax: 90 },
    'PC': { minTemp: 270, maxTemp: 310, bedTempMin: 100, bedTempMax: 120 },
    'PEEK': { minTemp: 360, maxTemp: 400, bedTempMin: 120, bedTempMax: 150 },
    'PEI': { minTemp: 340, maxTemp: 380, bedTempMin: 120, bedTempMax: 140 },
    'PVA': { minTemp: 190, maxTemp: 220, bedTempMin: 50, bedTempMax: 60 },
    'BVOH': { minTemp: 230, maxTemp: 260, bedTempMin: 60, bedTempMax: 80 },
    'HIPS': { minTemp: 230, maxTemp: 250, bedTempMin: 90, bedTempMax: 110 },
    'PP': { minTemp: 210, maxTemp: 240, bedTempMin: 40, bedTempMax: 60 },
    'PEBA': { minTemp: 215, maxTemp: 235, bedTempMin: 40, bedTempMax: 60 },
    'PLA-CF': { minTemp: 200, maxTemp: 230, bedTempMin: 50, bedTempMax: 70 },
    'ecoPLA-CF': { minTemp: 200, maxTemp: 230, bedTempMin: 50, bedTempMax: 70 },
    'PETG-CF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'easyPETG-CF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'PCTG-CF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'ABS-CF': { minTemp: 240, maxTemp: 270, bedTempMin: 95, bedTempMax: 115 },
    'ASA-CF': { minTemp: 250, maxTemp: 280, bedTempMin: 95, bedTempMax: 115 },
    'PA-CF': { minTemp: 250, maxTemp: 280, bedTempMin: 70, bedTempMax: 90 },
    'PA6-CF': { minTemp: 250, maxTemp: 290, bedTempMin: 80, bedTempMax: 100 },
    'PA12-CF': { minTemp: 250, maxTemp: 280, bedTempMin: 75, bedTempMax: 95 },
    'ePAHT-CF': { minTemp: 260, maxTemp: 290, bedTempMin: 80, bedTempMax: 100 },
    'PC-CF': { minTemp: 280, maxTemp: 320, bedTempMin: 110, bedTempMax: 130 },
    'PEEK-CF': { minTemp: 370, maxTemp: 410, bedTempMin: 130, bedTempMax: 160 },
    'PEI-CF': { minTemp: 350, maxTemp: 390, bedTempMin: 130, bedTempMax: 150 },
    'TPU-CF': { minTemp: 220, maxTemp: 250, bedTempMin: 40, bedTempMax: 70 },
    'TPE-CF': { minTemp: 220, maxTemp: 250, bedTempMin: 40, bedTempMax: 60 },
    'PP-CF': { minTemp: 230, maxTemp: 260, bedTempMin: 50, bedTempMax: 70 },
    'HIPS-CF': { minTemp: 240, maxTemp: 270, bedTempMin: 95, bedTempMax: 115 },
    'PEBA-CF': { minTemp: 225, maxTemp: 250, bedTempMin: 50, bedTempMax: 70 },
    'PLA-GF': { minTemp: 200, maxTemp: 230, bedTempMin: 55, bedTempMax: 70 },
    'ecoPLA-GF': { minTemp: 200, maxTemp: 230, bedTempMin: 55, bedTempMax: 70 },
    'PETG-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'easyPETG-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'PCTG-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 75, bedTempMax: 85 },
    'ABS-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 100, bedTempMax: 120 },
    'ASA-GF': { minTemp: 250, maxTemp: 280, bedTempMin: 100, bedTempMax: 120 },
    'PA-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 80, bedTempMax: 100 }
  },

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  async init() {
    this.nfcSupported = 'NDEFReader' in window;

    this.initColorPalette();
    this.sortBrandSelect();
    this.attachEventListeners();

    // Check NFC on load
    if (this.nfcSupported) {
      document.getElementById('nfcStatus').textContent = 'NFC ready';
    } else {
      document.getElementById('nfcStatus').textContent = 'NFC not supported';
    }
  },

  attachEventListeners() {
    // Navigation
    document.getElementById('btnRead').addEventListener('click', () => this.showPage('readPage'));
    document.getElementById('btnCreate').addEventListener('click', () => this.showPage('createPage'));
    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => this.showPage('menuPage'));
    });

    // Read page
    document.getElementById('btnStartScan').addEventListener('click', () => this.startNFCRead());
    document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

    // Create page
    document.getElementById('materialSelect').addEventListener('change', (e) => this.updateTemperatures(e.target.value));
    document.getElementById('colorHex').addEventListener('change', (e) => this.updateColor(e.target.value));
    //document.getElementById('btnColorPicker').addEventListener('click', () => this.openColorPicker());
    document.getElementById('btnDownload').addEventListener('click', () => this.downloadFile());
    document.getElementById('btnWrite').addEventListener('click', () => this.startNFCWrite());

    // Color picker
    //document.getElementById('colorPickerOk').addEventListener('click', () => this.confirmColorPicker());
    //document.getElementById('colorPickerCancel').addEventListener('click', () => this.closeColorPicker());

    // Form field changes
    ['materialSelect', 'colorHex', 'brandSelect', 'minTemp', 'maxTemp', 'bedTempMin', 'bedTempMax'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.updateRecordSize());
    });
  },

  // ========================================================================
  // PAGE NAVIGATION
  // ========================================================================

  showPage(pageId) {
    document.querySelectorAll('[id$="Page"]').forEach(page => {
      page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
  },

  // ========================================================================
  // NFC READING
  // ========================================================================

  startNFCRead() {
    if (!this.nfcSupported) {
      this.showStatus('readStatus', 'error', 'NFC not supported');
      return;
    }

    const btn = document.getElementById('btnStartScan');
    btn.textContent = 'Scanning...';
    btn.disabled = true;

    nfcReader.start(
      (formData) => this.loadFormData(formData),
      (error) => {
        this.showStatus('readStatus', 'error', error);
        btn.textContent = 'Start Scanning';
        btn.disabled = false;
      }
    );
  },

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Only accept JSON files
    if (!file.name.endsWith('.json')) {
      this.showStatus('readStatus', 'error', 'Only .json files supported (OpenSpool)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const formData = OpenSpool.readFromBuffer(e.target.result);
      if (formData) {
        this.loadFormData(formData);
        this.showStatus('readStatus', 'success', 'File loaded successfully');
      } else {
        this.showStatus('readStatus', 'error', 'Invalid OpenSpool format');
      }
    };
    reader.readAsText(file);
  },

  loadFormData(formData) {
    document.getElementById('materialSelect').value = formData.materialType;
    document.getElementById('colorHex').value = formData.colorHex;
    document.getElementById('brandSelect').value = formData.brand;
    document.getElementById('minTemp').value = formData.minTemp;
    document.getElementById('maxTemp').value = formData.maxTemp;
    document.getElementById('bedTempMin').value = formData.bedTempMin;
    document.getElementById('bedTempMax').value = formData.bedTempMax;

    this.updateColor(formData.colorHex);
    this.showPage('readPage');
    this.showStatus('readStatus', 'success', 'Tag data loaded');
  },

  // ========================================================================
  // NFC WRITING
  // ========================================================================

  async startNFCWrite() {
    if (!this.nfcSupported) {
      this.showStatus('writeStatus', 'error', 'NFC not supported');
      return;
    }

    const formData = this.getFormData();
    if (!this.validateFormData(formData)) {
      this.showStatus('writeStatus', 'error', 'Please fill in required fields');
      return;
    }

    try {
      const data = OpenSpool.generateData(formData);
      const records = OpenSpool.createNDEFRecord(data);

      const btn = document.getElementById('btnWrite');
      btn.disabled = true;
      btn.textContent = 'Writing...';

      await nfcWriter.write(records, (status, error) => {
        if (status === 'success') {
          this.showStatus('writeStatus', 'success', 'Tag written successfully');
          btn.textContent = '📝 Write to NFC';
          btn.disabled = false;
        } else if (status === 'error') {
          this.showStatus('writeStatus', 'error', error.message || 'Write failed');
          btn.textContent = '📝 Write to NFC';
          btn.disabled = false;
        }
      });
    } catch (error) {
      this.showStatus('writeStatus', 'error', error.message);
      document.getElementById('btnWrite').disabled = false;
      document.getElementById('btnWrite').textContent = '📝 Write to NFC';
    }
  },

  // ========================================================================
  // FILE OPERATIONS
  // ========================================================================

  downloadFile() {
    const formData = this.getFormData();
    if (!this.validateFormData(formData)) {
      this.showStatus('writeStatus', 'error', 'Please fill in required fields');
      return;
    }

    const data = OpenSpool.generateData(formData);
    OpenSpool.downloadJSON(data);
    this.showStatus('writeStatus', 'success', 'File downloaded');
  },

  // ========================================================================
  // FORM DATA MANAGEMENT
  // ========================================================================

  getFormData() {
    return {
      materialType: document.getElementById('materialSelect').value,
      colorHex: document.getElementById('colorHex').value,
      brand: document.getElementById('brandSelect').value,
      minTemp: document.getElementById('minTemp').value,
      maxTemp: document.getElementById('maxTemp').value,
      bedTempMin: document.getElementById('bedTempMin').value,
      bedTempMax: document.getElementById('bedTempMax').value
    };
  },

  validateFormData(formData) {
    return formData.materialType && 
           formData.colorHex && 
           formData.colorHex.match(/^#?[0-9A-F]{6}$/i);
  },

  updateTemperatures(materialType) {
    const preset = this.temperaturePresets[materialType];
    if (preset) {
      document.getElementById('minTemp').value = preset.minTemp;
      document.getElementById('maxTemp').value = preset.maxTemp;
      document.getElementById('bedTempMin').value = preset.bedTempMin;
      document.getElementById('bedTempMax').value = preset.bedTempMax;
    }
    this.updateRecordSize();
  },

  updateRecordSize() {
    try {
      const formData = this.getFormData();
      const data = OpenSpool.generateData(formData);
      const size = OpenSpool.calculateRecordSize(data);
      const sizeInfo = document.getElementById('recordSizeInfo');

      let tagType = '';
      let colorStyle = '';

      if (size > 888) {
        colorStyle = 'rgba(244, 67, 54, 0.2)';
        sizeInfo.style.borderColor = 'var(--error)';
        tagType = 'Too large for any supported tag';
      } else if (size > 504) {
        colorStyle = 'rgba(255, 152, 0, 0.2)';
        sizeInfo.style.borderColor = 'var(--warning)';
        tagType = 'NTAG216 required';
      } else if (size > 144) {
        colorStyle = 'rgba(76, 175, 80, 0.1)';
        sizeInfo.style.borderColor = 'var(--success)';
        tagType = 'NTAG215/216';
      } else {
        colorStyle = 'rgba(76, 175, 80, 0.1)';
        sizeInfo.style.borderColor = 'var(--success)';
        tagType = 'NTAG213/215/216';
      }

      sizeInfo.style.background = colorStyle;
      document.getElementById('recordSize').textContent = `${size} bytes (${tagType})`;
    } catch (e) {
      // Silently fail if form is incomplete
    }
  },

  // ========================================================================
  // COLOR MANAGEMENT
  // ========================================================================

  initColorPalette() {
    const palette = document.getElementById('colorPalette');
    const input = document.getElementById('colorHex');

    this.colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.title = color;
      swatch.addEventListener('click', () => {
        input.value = color.toUpperCase();
        this.updateColor(color);
        this.updateRecordSize();
      });
      palette.appendChild(swatch);
    });
  },

  updateColor(color) {
    const normalizedColor = color.toLowerCase();
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      const swatchColor = swatch.style.backgroundColor;
      const swatchHex = this.rgbToHex(swatchColor).toLowerCase();
      swatch.classList.toggle('selected', swatchHex === normalizedColor);
    });

    const preview = document.getElementById('colorPreview');
    if (preview) {
      preview.style.background = color;
    }
  },

  rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return '#' + result
      .slice(0, 3)
      .map(x => parseInt(x).toString(16).padStart(2, '0'))
      .join('');
  },

  openColorPicker() {
    // TODO: Implement color picker modal
  },

  confirmColorPicker() {
    // TODO: Implement color picker confirmation
  },

  closeColorPicker() {
    // TODO: Implement color picker close
  },

  // ========================================================================
  // UTILITIES
  // ========================================================================

  sortBrandSelect() {
    const sel = document.getElementById('brandSelect');
    const options = Array.from(sel.options);
    const custom = options.find(o => o.value === 'custom');
    const rest = options.filter(o => o !== custom);

    rest.sort((a, b) => a.text.localeCompare(b.text, 'en'));
    rest.forEach(o => sel.appendChild(o));

    if (custom) sel.appendChild(custom);
  },

  showStatus(id, type, message) {
    const element = document.getElementById(id);
    element.className = `status-message ${type ? 'show ' + type : ''}`;
    element.textContent = message;

    if (type === 'success') {
      setTimeout(() => element.classList.remove('show'), 5000);
    }
  }
};

// ============================================================================
// INITIALIZATION ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
