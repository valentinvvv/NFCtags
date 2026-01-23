  handleWriteProgress(writeBtn, originalText, status, error) {
    writeBtn.disabled = false;

    if (status === 'reading') {
      writeBtn.textContent = '\u274c Cancel';
      writeBtn.classList.remove('btn-primary');
      writeBtn.classList.add('btn-warning');
      this.showOperationIndicator(true, '\ud83d\udcd6 Waiting for NFC tag...');
      this.showStatus('writeStatus', 'warning', 'Hold device near NFC tag...');
    } else if (status === 'writing') {
      writeBtn.disabled = true;
      writeBtn.textContent = '\u231f Writing...';
      this.showOperationIndicator(true, '\ud83d\udcdd Writing to tag...');
      this.showStatus('writeStatus', 'warning', 'Writing to tag...');
    } else if (status === 'success') {
      writeBtn.textContent = originalText;
      writeBtn.classList.remove('btn-warning');
      writeBtn.classList.add('btn-primary');
      this.showOperationIndicator(false);
      this.showStatus('writeStatus', 'success', '\u2713 Tag written successfully!');
    } else if (status === 'error') {
      writeBtn.textContent = originalText;
      writeBtn.classList.remove('btn-warning');
      writeBtn.classList.add('btn-primary');
      this.showOperationIndicator(false);
      const errorMsg = error.name === 'NotAllowedError' ? 'NFC permission denied' :
        error.name === 'AbortError' ? 'Write cancelled' :
          error.message;
      this.showStatus('writeStatus', 'error', errorMsg);
    }
  },