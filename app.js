      downloadForNFC() {
          const formData = this.getFormData();
          const nfcData = OpenSpool.generateData(formData);
          
          const filamentName = formData.brand || 'Generic';
          const filename = `${filamentName}_nfc`
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();
          
          filamentGenerator.downloadJsonFile(nfcData, filename);
          this.showStatus('writeStatus', 'success', `Downloaded ${filename}.json`);
        },