  showOperationIndicator(show, text = 'Processing...') {
    const indicator = document.getElementById('operationIndicator');
    if (show) {
      document.getElementById('operationText').textContent = text;
      indicator.classList.remove('hidden');
      indicator.classList.add('show');
    } else {
      indicator.classList.remove('show');
      indicator.classList.add('hidden');
    }
  },