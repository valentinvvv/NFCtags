/**
 * NFC Filament Spool Tag Manager
 * Simplified and cleaned version
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

      this.reader.addEventListener('reading', ({ message, serialNumber }) => {
        onRead(message, serialNumber);
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
      if (onProgress) onProgress('reading');
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
  cameraCaptureColor: null,
  selectedFilament: null,
  cameraStream: null,
  colorSamplingInterval: null,

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
    'PA-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 80, bedTempMax: 100 },
    'PA6-GF': { minTemp: 250, maxTemp: 280, bedTempMin: 85, bedTempMax: 105 },
    'PA12-GF': { minTemp: 240, maxTemp: 270, bedTempMin: 80, bedTempMax: 100 },
    'PC-GF': { minTemp: 270, maxTemp: 300, bedTempMin: 110, bedTempMax: 130 },
    'PEEK-GF': { minTemp: 370, maxTemp: 410, bedTempMin: 135, bedTempMax: 165 },
    'PEI-GF': { minTemp: 350, maxTemp: 390, bedTempMin: 130, bedTempMax: 150 },
    'TPU-GF': { minTemp: 220, maxTemp: 250, bedTempMin: 45, bedTempMax: 70 },
    'TPE-GF': { minTemp: 220, maxTemp: 250, bedTempMin: 45, bedTempMax: 65 },
    'PP-GF': { minTemp: 230, maxTemp: 260, bedTempMin: 55, bedTempMax: 75 },
    'PEBA-GF': { minTemp: 225, maxTemp: 250, bedTempMin: 50, bedTempMax: 70 },
    'Wood': { minTemp: 190, maxTemp: 215, bedTempMin: 50, bedTempMax: 65 },
    'Stone': { minTemp: 190, maxTemp: 215, bedTempMin: 50, bedTempMax: 65 },
    'Metal-Copper': { minTemp: 195, maxTemp: 225, bedTempMin: 55, bedTempMax: 70 },
    'Metal-Bronze': { minTemp: 200, maxTemp: 230, bedTempMin: 60, bedTempMax: 75 },
    'Metal-Brass': { minTemp: 200, maxTemp: 230, bedTempMin: 60, bedTempMax: 75 },
    'Carbon-Graphene': { minTemp: 240, maxTemp: 270, bedTempMin: 95, bedTempMax: 115 },
    'Nylon-Hydrophobic-CF': { minTemp: 250, maxTemp: 280, bedTempMin: 80, bedTempMax: 100 }
  },

  // Touch locking state
  touchLock: {
    active: false,
    lockedTo: null  // 'hue' or 'sv'
  },

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  init() {
    this.checkNFC();
    this.initColorPalette();
    this.initEventListeners();
    this.updateColor('#FFFFFF');
    this.applyTemperaturePreset();
    this.updateRecordSize();
  },

  async checkNFC() {
    if ('NDEFReader' in window) {
      try {
        await navigator.permissions.query({ name: 'nfc' });
        this.nfcSupported = true;
        this.updateNFCStatus(true, 'NFC is ready');
      } catch {
        this.nfcSupported = true;
        this.updateNFCStatus(true, 'NFC available');
      }
      document.getElementById('scanBtn').disabled = false;
      document.getElementById('writeBtn').disabled = false;
    } else {
      this.updateNFCStatus(false, 'NFC not supported on this device');
    }
  },

  updateNFCStatus(ready, message) {
    const indicator = document.getElementById('nfcIndicator');
    const text = document.getElementById('nfcStatusText');
    indicator.classList.toggle('ready', ready);
    text.textContent = message;
  },

  // ========================================================================
  // MODE MANAGEMENT
  // ========================================================================

  setMode(mode) {
    this.stopScanning();

    document.getElementById('modeSelection').classList.add('hidden');
    document.getElementById('readSection').classList.add('hidden');
    document.getElementById('formSection').classList.add('hidden');

    if (mode === 'menu') {
      document.getElementById('modeSelection').classList.remove('hidden');
    } else if (mode === 'read') {
      document.getElementById('readSection').classList.remove('hidden');
      this.clearReadData();
      this.startScanning();
    } else if (mode === 'create' || mode === 'update') {
      document.getElementById('formSection').classList.remove('hidden');
      const title = mode === 'create' ? 'Create New Tag' : 'Update Tag Data';
      document.getElementById('formTitle').textContent = title;
      this.updateJsonPreview();
    }
  },

  clearReadData() {
    document.getElementById('fileInput').value = '';
    document.getElementById('decodedData').textContent = '';
    document.getElementById('decodedDataContainer').classList.add('hidden');
    this.showStatus('readStatus', '', '');
  },

  // ========================================================================
  // JSON PREVIEW AND DOWNLOAD
  // ========================================================================

  updateJsonPreview() {
    const formData = this.getFormData();
    const jsonData = filamentGenerator.generateFromFormData(formData);
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    document.getElementById('jsonPreview').textContent = jsonString;
    this.updateRecordSize();
  },

  copyJsonToClipboard() {
    const jsonPreview = document.getElementById('jsonPreview');
    const text = jsonPreview.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
      this.showStatus('writeStatus', 'success', 'JSON copied to clipboard');
    }).catch(() => {
      this.showStatus('writeStatus', 'error', 'Failed to copy JSON');
    });
  },

  downloadJsonFile() {
    const formData = this.getFormData();
    const jsonData = filamentGenerator.generateFromFormData(formData);
    
    const filamentName = jsonData.filament_settings_id[0];
    const filename = `${filamentName}`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
    
    filamentGenerator.downloadJSON(jsonData, filename);
    this.showStatus('writeStatus', 'success', `Downloaded ${filename}`);
  },

  // ========================================================================
  // NFC SCANNING
  // ========================================================================

  toggleScan() {
    if (nfcReader.isScanning()) {
      this.stopScanning();
    } else {
      this.startScanning();
    }
  },

  startScanning() {
    if (!this.nfcSupported) {
      this.showStatus('readStatus', 'error', 'NFC not supported');
      return;
    }

    this.showStatus('readStatus', 'warning', 'Hold device near NFC tag...');

    nfcReader.start(
      (message, serialNumber) => this.handleTagRead(message, serialNumber),
      (errorMsg) => this.handleScanError(errorMsg)
    );

    const scanBtn = document.getElementById('scanBtn');
    scanBtn.textContent = 'Stop Scanning';
    scanBtn.classList.remove('btn-success');
    scanBtn.classList.add('btn-secondary');
  },

  stopScanning() {
    nfcReader.stop();

    const scanBtn = document.getElementById('scanBtn');
    scanBtn.textContent = 'Start Scanning';
    scanBtn.classList.remove('btn-secondary');
    scanBtn.classList.add('btn-success');

    this.showStatus('readStatus', '', '');
  },

  handleScanError(errorMsg) {
    this.stopScanning();
    this.showStatus('readStatus', 'error', errorMsg);
  },

  handleTagRead(message, serialNumber) {
    let output = `Serial: ${serialNumber}\n\n`;
    let result = null;

    for (const record of message.records) {
      result = OpenSpool.parseNDEFRecord(record);
      if (result) {
        output += `Format: OpenSpool (JSON)\n`;
        output += `Material: ${result.materialType}\n`;
        output += `Type: ${result.subType}\n`;
        output += `Brand: ${result.brand}\n`;
        output += `Color: #${result.colorHex}\n`;
        output += `Min Nozzle Temp: #${result.min_temp}\n`;
        output += `Max Nozzle Temp: #${result.max_temp}\n`;
        output += `Min Bed Temp: #${result.bed_min_temp}\n`;
        output += `Max Bed Temp: #${result.bed_max_temp}\n`;

        break;
      }

    }

    if (result) {
      this.showDecodedData(output);
      this.populateForm(result);
      this.showStatus('readStatus', 'success', 'Tag read successfully! Ready for next tag...');
      this.showStatus('writeStatus', 'success', 'Data loaded');
      this.setMode('update');
    } else {
      this.showDecodedData(output + '\nNo valid data found');
      this.showStatus('readStatus', 'warning', 'No recognized format found. Keep scanning...');
    }
  },

  showDecodedData(text) {
    document.getElementById('decodedData').textContent = text;
    document.getElementById('decodedDataContainer').classList.remove('hidden');
  },

  // ========================================================================
  // FILE HANDLING
  // ========================================================================

  initEventListeners() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files?.[0]) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    const colorHex = document.getElementById('colorHex');
    if (colorHex) {
      colorHex.addEventListener('input', (e) => {
        let v = e.target.value.toUpperCase();
        v = v.replace(/[^#0-9A-F]/g, '');
        if (!v.startsWith('#')) v = '#' + v;
        v = '#' + v.slice(1).replace(/[^0-9A-F]/g, '').slice(0, 6);
        e.target.value = v;
        this.updateColor(v);
        this.updateJsonPreview();
      });
    }

    const updateTriggers = ['brandInput', 'subTypeInput', 'materialTypeInput', 'minTemp', 'maxTemp', 'bedTempMin', 'bedTempMax'];
    updateTriggers.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.updateJsonPreview());
        element.addEventListener('input', () => this.updateJsonPreview());
      }
    });
  },

  handleFileUpload(file) {
    if (!file) return;

    nfcReader.stop();
    const format = formats.detectFormatFromFilename(file.name);

    if (!format) {
      this.showStatus('readStatus', 'error', 'Unsupported file type');
      return;
    }

    let output = `File: ${file.name}\n\n`;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = OpenSpool.parseData(e.target.result);
        this.populateForm(data);
        output += `Format: OpenSpool (JSON)\n`;
        output += `Material: ${data.materialType}\n`;
        this.showDecodedData(output);
        this.showStatus('readStatus', 'success', 'File loaded');
        this.setMode('update');
      } catch (err) {
        this.showStatus('readStatus', 'error', 'Invalid file format');
      }
    };

    reader.readAsArrayBuffer(file);
  },

  // ========================================================================
  // FORM MANAGEMENT
  // ========================================================================

  populateForm(data) {
    document.getElementById('materialTypeInput').value = data.materialType || 'PLA';
    const colorHex = this.normalizeHexColor((data.colorHex || 'FFFFFF'))
    const colorInput = document.getElementById('colorHex');
    colorInput.value = colorHex;
    this.updateColor(colorHex);

    document.getElementById('brandInput').value = data.brand || 'Generic';
    document.getElementById('subTypeInput').value = data.subtype || 'Basic';

    document.getElementById('minTemp').value = data.minTemp || '';
    document.getElementById('maxTemp').value = data.maxTemp || '';
    document.getElementById('bedTempMin').value = data.bedTempMin || '';
    document.getElementById('bedTempMax').value = data.bedTempMax || '';

    this.updateJsonPreview();
  },

  getFormData() {
    return {
      material: document.getElementById('materialTypeInput').value || 'PETG',
      type: document.getElementById('subTypeInput').value || 'Basic',
      brand: document.getElementById('brandInput').value || 'Generic',
      minNozzle: parseInt(document.getElementById('minTemp').value) || 230,
      maxNozzle: parseInt(document.getElementById('maxTemp').value) || 250,
      minBed: parseInt(document.getElementById('bedTempMin').value) || 70,
      maxBed: parseInt(document.getElementById('bedTempMax').value) || 80
    };
  },

  applyTemperaturePreset() {
    const materialType = document.getElementById('materialTypeInput').value;
    const preset = this.temperaturePresets[materialType];

    if (preset) {
      document.getElementById('minTemp').value = preset.minTemp;
      document.getElementById('maxTemp').value = preset.maxTemp;
      document.getElementById('bedTempMin').value = preset.bedTempMin;
      document.getElementById('bedTempMax').value = preset.bedTempMax;

      this.updateJsonPreview();
    }
  },

  // ========================================================================
  // NFC WRITING
  // ========================================================================

  async writeNFC() {
    if (!this.nfcSupported) {
      this.showStatus('writeStatus', 'error', 'NFC not supported');
      return;
    }

    const writeBtn = document.getElementById('writeBtn');
    const originalText = writeBtn.textContent;
    const formData = this.getFormData();
    const data = OpenSpool.generateData(formData);
    const records = OpenSpool.createNDEFRecord(data);

    try {
      await nfcWriter.write(records, (status, error) => {
        this.handleWriteProgress(writeBtn, originalText, status, error);
      });
    } catch (error) {
      writeBtn.textContent = originalText;
      writeBtn.classList.remove('btn-secondary');
      writeBtn.classList.add('btn-success');
      this.showStatus('writeStatus', 'error', error.message);
    }
  },

  handleWriteProgress(writeBtn, originalText, status, error) {
    writeBtn.disabled = false;

    if (status === 'reading') {
      writeBtn.textContent = '❌ Cancel';
      writeBtn.classList.remove('btn-success');
      writeBtn.classList.add('btn-secondary');
      this.showStatus('writeStatus', 'warning', 'Hold device near NFC tag...');
    } else if (status === 'writing') {
      writeBtn.disabled = true;
      writeBtn.textContent = '⏳ Writing...';
      this.showStatus('writeStatus', 'warning', 'Writing to tag...');
    } else if (status === 'success') {
      writeBtn.textContent = originalText;
      writeBtn.classList.remove('btn-secondary');
      writeBtn.classList.add('btn-success');
      this.showStatus('writeStatus', 'success', 'Tag written successfully');
    } else if (status === 'error') {
      writeBtn.textContent = originalText;
      writeBtn.classList.remove('btn-secondary');
      writeBtn.classList.add('btn-success');
      const errorMsg = error.name === 'NotAllowedError' ? 'NFC permission denied' :
        error.name === 'AbortError' ? 'Write cancelled' :
          error.message;
      this.showStatus('writeStatus', 'error', errorMsg);
    }
  },

  toggleWrite() {
    if (nfcWriter.isWriting()) {
      this.cancelWrite();
    } else {
      this.writeNFC();
    }
  },

  cancelWrite() {
    nfcWriter.cancel();
    const writeBtn = document.getElementById('writeBtn');
    writeBtn.textContent = '📝 Write to NFC';
    writeBtn.classList.remove('btn-secondary');
    writeBtn.classList.add('btn-success');
    this.showStatus('writeStatus', '', '');
  },

  downloadNFCFile() {
    const formData = this.getFormData();
    const data = OpenSpool.generateData(formData);
    OpenSpool.downloadNFCJSON(data);
    this.showStatus('writeStatus', 'success', 'File downloaded');
  },

  // ========================================================================
  // RECORD SIZE CALCULATION
  // ========================================================================

  updateRecordSize() {
    try {
      const formData = this.getFormData();
      const size = OpenSpool.calculateRecordSize(formData);
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
      swatch.onclick = () => {
        input.value = color.toUpperCase();
        this.updateColor(color);
        this.updateJsonPreview();
      };
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

  normalizeHexColor(hex) {
    if (!hex) return null;

    hex = hex.trim().toLowerCase();

    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    if (hex.length === 4) {
      const r = hex[1];
      const g = hex[2];
      const b = hex[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    if (hex.length === 7) {
      return hex.toUpperCase();
    }

    return null;
  },

  toggleColorPicker() {
    const modal = document.getElementById('colorSpectrumModal');
    const hex = document.getElementById('colorHex').value || '#FFFFFF';
    this.openColorPicker(hex);
  },

  openColorPicker(hex) {
    const modal = document.getElementById('colorSpectrumModal');
    const rgb = this.hexToRgb(hex);

    document.getElementById('spectrumR').value = rgb.r;
    document.getElementById('spectrumG').value = rgb.g;
    document.getElementById('spectrumB').value = rgb.b;

    this.updateSpectrumFromRGB();
    modal.classList.remove('hidden');
    modal.classList.add('show');

    if (!modal.dataset.initialized) {
      this.initSpectrumPicker();
      modal.dataset.initialized = 'true';
    }
  },

  closeColorPicker() {
    const modal = document.getElementById('colorSpectrumModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
  },

  confirmColorPicker() {
    const hex = document.getElementById('spectrumHexDisplay').textContent;
    document.getElementById('colorHex').value = hex;
    this.updateColor(hex);
    this.updateJsonPreview();
    this.closeColorPicker();
  },

  initSpectrumPicker() {
    const spectrumHue = document.getElementById('spectrumHue');
    const spectrumSV = document.getElementById('spectrumSV');

    // ===== HUE SLIDER HANDLING =====
    const updateHue = (e) => {
      const rect = spectrumHue.getBoundingClientRect();
      const x = (e.clientX !== undefined ? e.clientX : e.pageX) - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      document.getElementById('spectrumHueSlider').style.left = percent + '%';
      this.updateColorFromHue();
    };

    // Mouse events for hue
    spectrumHue.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      updateHue(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (spectrumHue.matches(':active')) {
        updateHue(e);
      }
    });

    spectrumHue.addEventListener('click', (e) => {
      e.stopPropagation();
      updateHue(e);
    });

    // Touch events for hue - ONLY if not locked to SV
    spectrumHue.addEventListener('touchstart', (e) => {
      if (this.touchLock.lockedTo && this.touchLock.lockedTo !== 'hue') {
        return;
      }
      e.stopPropagation();
      this.touchLock.active = true;
      this.touchLock.lockedTo = 'hue';
      updateHue(e.touches[0]);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (this.touchLock.active && this.touchLock.lockedTo === 'hue') {
        updateHue(e.touches[0]);
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      this.touchLock.active = false;
      this.touchLock.lockedTo = null;
    });

    // ===== SATURATION/VALUE (S/V) PICKER HANDLING =====
    const updateSV = (e) => {
      const rect = spectrumSV.getBoundingClientRect();
      const x = (e.clientX !== undefined ? e.clientX : e.pageX) - rect.left;
      const y = (e.clientY !== undefined ? e.clientY : e.pageY) - rect.top;

      const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const value = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));

      const pointer = document.getElementById('spectrumSVPointer');
      pointer.style.left = saturation + '%';
      pointer.style.top = (100 - value) + '%';

      this.updateColorFromSV();
    };

    // Mouse events for S/V
    spectrumSV.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      updateSV(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (spectrumSV.matches(':active')) {
        updateSV(e);
      }
    });

    spectrumSV.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSV(e);
    });

    // Touch events for S/V - ONLY if not locked to hue
    spectrumSV.addEventListener('touchstart', (e) => {
      if (this.touchLock.lockedTo && this.touchLock.lockedTo !== 'sv') {
        return;
      }
      e.stopPropagation();
      this.touchLock.active = true;
      this.touchLock.lockedTo = 'sv';
      updateSV(e.touches[0]);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (this.touchLock.active && this.touchLock.lockedTo === 'sv') {
        e.preventDefault();
        updateSV(e.touches[0]);
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      this.touchLock.active = false;
      this.touchLock.lockedTo = null;
    });

    // RGB sliders
    ['R', 'G', 'B'].forEach(channel => {
      const slider = document.getElementById(`spectrum${channel}`);
      const text = document.getElementById(`spectrum${channel}Text`);

      slider.addEventListener('input', () => {
        text.value = slider.value;
        this.updateColorFromRGB();
      });

      text.addEventListener('input', () => {
        let val = parseInt(text.value) || 0;
        val = Math.max(0, Math.min(255, val));
        text.value = val;
        slider.value = val;
        this.updateColorFromRGB();
      });
    });
  },

  updateColorFromHue() {
    const hueSlider = document.getElementById('spectrumHueSlider');
    const svPointer = document.getElementById('spectrumSVPointer');

    const hue = (parseFloat(hueSlider.style.left) || 0) * 3.6;
    const saturation = parseFloat(svPointer.style.left) || 100;
    const value = 100 - (parseFloat(svPointer.style.top) || 0);

    const rgb = this.hsvToRgb(hue, saturation, value);

    // Update RGB inputs
    document.getElementById('spectrumR').value = rgb.r;
    document.getElementById('spectrumG').value = rgb.g;
    document.getElementById('spectrumB').value = rgb.b;
    document.getElementById('spectrumRText').value = rgb.r;
    document.getElementById('spectrumGText').value = rgb.g;
    document.getElementById('spectrumBText').value = rgb.b;

    // Update S/V gradient background
    const hueColor = `hsl(${hue}, 100%, 50%)`;
    document.getElementById('spectrumSV').style.background = 
      `linear-gradient(to right, white, ${hueColor}), linear-gradient(to top, black, transparent)`;

    // Update display
    this.updateSpectrumDisplay(rgb.r, rgb.g, rgb.b);
  },

  updateColorFromSV() {
    const hueSlider = document.getElementById('spectrumHueSlider');
    const svPointer = document.getElementById('spectrumSVPointer');

    const hue = (parseFloat(hueSlider.style.left) || 0) * 3.6;
    const saturation = parseFloat(svPointer.style.left) || 100;
    const value = 100 - (parseFloat(svPointer.style.top) || 0);

    const rgb = this.hsvToRgb(hue, saturation, value);

    // Update RGB inputs only, DON'T update gradient
    document.getElementById('spectrumR').value = rgb.r;
    document.getElementById('spectrumG').value = rgb.g;
    document.getElementById('spectrumB').value = rgb.b;
    document.getElementById('spectrumRText').value = rgb.r;
    document.getElementById('spectrumGText').value = rgb.g;
    document.getElementById('spectrumBText').value = rgb.b;

    // Update display ONLY
    this.updateSpectrumDisplayNoGradient(rgb.r, rgb.g, rgb.b);
  },

  updateColorFromRGB() {
    const r = parseInt(document.getElementById('spectrumR').value) || 0;
    const g = parseInt(document.getElementById('spectrumG').value) || 0;
    const b = parseInt(document.getElementById('spectrumB').value) || 0;

    document.getElementById('spectrumRText').value = r;
    document.getElementById('spectrumGText').value = g;
    document.getElementById('spectrumBText').value = b;

    const hsv = this.rgbToHsv(r, g, b);

    // Update slider positions
    const huePercent = (hsv.h / 360) * 100;
    document.getElementById('spectrumHueSlider').style.left = huePercent + '%';
    document.getElementById('spectrumSVPointer').style.left = hsv.s + '%';
    document.getElementById('spectrumSVPointer').style.top = (100 - hsv.v) + '%';

    // Update gradient AND display
    const hueColor = `hsl(${hsv.h}, 100%, 50%)`;
    document.getElementById('spectrumSV').style.background = 
      `linear-gradient(to right, white, ${hueColor}), linear-gradient(to top, black, transparent)`;

    this.updateSpectrumDisplay(r, g, b);
  },

  updateSpectrumDisplay(r, g, b) {
    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();

    document.getElementById('spectrumPreviewBox').style.background = hex;
    document.getElementById('spectrumHexDisplay').textContent = hex;
    document.getElementById('spectrumRgbDisplay').textContent = `rgb(${r}, ${g}, ${b})`;
  },

  updateSpectrumDisplayNoGradient(r, g, b) {
    const hex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();

    document.getElementById('spectrumPreviewBox').style.background = hex;
    document.getElementById('spectrumHexDisplay').textContent = hex;
    document.getElementById('spectrumRgbDisplay').textContent = `rgb(${r}, ${g}, ${b})`;
  },

  updateSpectrumFromRGB() {
    this.updateColorFromRGB();
  },

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  },

  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / delta + 2) / 6;
      else h = ((r - g) / delta + 4) / 6;
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return {
      h: h * 360,
      s: s * 100,
      v: v * 100
    };
  },

  hsvToRgb(h, s, v) {
    h = (h % 360) / 60;
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 1) { r = c; g = x; b = 0; }
    else if (h < 2) { r = x; g = c; b = 0; }
    else if (h < 3) { r = 0; g = c; b = x; }
    else if (h < 4) { r = 0; g = x; b = c; }
    else if (h < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  },

  // ========================================================================
  // CAMERA COLOR PICKER
  // ========================================================================

  toggleCameraPicker() {
    const modal = document.getElementById('cameraModal');
    if (modal.classList.contains('hidden')) {
      this.openCameraPicker();
    } else {
      this.closeCameraPicker();
    }
  },

  async openCameraPicker() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraFeed');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      video.srcObject = stream;
      this.cameraStream = stream;

      modal.classList.remove('hidden');
      modal.classList.add('show');

      // Start color sampling
      this.startColorSampling();
    } catch (error) {
      this.showStatus('writeStatus', 'error', 'Camera access denied: ' + error.message);
    }
  },

  closeCameraPicker() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraFeed');

    // Stop color sampling
    if (this.colorSamplingInterval) {
      clearInterval(this.colorSamplingInterval);
      this.colorSamplingInterval = null;
    }

    // Stop camera stream
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }

    video.srcObject = null;
    modal.classList.remove('show');
    modal.classList.add('hidden');
  },

  startColorSampling() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Clear any existing interval
    if (this.colorSamplingInterval) {
      clearInterval(this.colorSamplingInterval);
    }

    this.colorSamplingInterval = setInterval(() => {
      if (!video.srcObject) {
        clearInterval(this.colorSamplingInterval);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) return;

      // Draw video frame
      ctx.drawImage(video, 0, 0);

      // Sample center pixel (crosshair area)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const imageData = ctx.getImageData(centerX, centerY, 1, 1);
      const data = imageData.data;

      const r = data[0];
      const g = data[1];
      const b = data[2];

      const hex = '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('').toUpperCase();

      // Update display
      document.getElementById('cameraColorBox').style.background = hex;
      document.getElementById('cameraHexDisplay').textContent = hex;
      document.getElementById('cameraRgbDisplay').textContent = `rgb(${r}, ${g}, ${b})`;

      this.cameraCaptureColor = { hex, r, g, b };
    }, 100); // Update every 100ms
  },

  useCameraColor() {
    if (!this.cameraCaptureColor) return;

    const hex = this.cameraCaptureColor.hex;
    document.getElementById('colorHex').value = hex;
    this.updateColor(hex);
    this.updateJsonPreview();
    this.closeCameraPicker();
  },

  // ========================================================================
  // UTILITIES
  // ========================================================================

  showStatus(id, type, message) {
    const element = document.getElementById(id);
    element.className = `status-message ${type ? 'show ' + type : ''}`;
    element.textContent = message;

    if (type === 'success') {
      setTimeout(() => element.classList.remove('show'), 5000);
    }
  }
};

const formats = {

  detectFormatFromFilename(filename) {
    if (filename.endsWith('.json')) {
      return 'openspool';
    }
    return null;
  },

  calculateRecordSize(formData) {
    try {
      const data = OpenSpool.generateData(formData);
      const records = OpenSpool.createNDEFRecord(data);

      let totalSize = 0;
      for (const record of records) {
        // NDEF record header overhead
        // 1 byte: flags
        // 1 byte: type length
        // 1-4 bytes: payload length (depends on size)
        // No ID field for our records
        const mediaType = record.mediaType;
        const payloadSize = record.data.byteLength || record.data.length;

        let headerSize = 2; // flags + type length
        if (payloadSize < 256) {
          headerSize += 1; // short record (1 byte payload length)
        } else {
          headerSize += 4; // long record (4 byte payload length)
        }

        const typeLength = mediaType.length;
        const recordSize = headerSize + typeLength + payloadSize;
        totalSize += recordSize;
      }

      return totalSize;
    } catch (e) {
      return 0;
    }
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});