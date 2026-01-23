  updateJsonPreview() {
    const formData = this.getFormData();
    const result = filamentGenerator.generateFromFormData(formData);
    const jsonData = result.json;
    const validation = result.validation;
    
    // Display validation alert if needed
    this.displayValidationAlert(validation);
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    document.getElementById('jsonPreview').textContent = jsonString;
    this.updateRecordSize();
  },

  displayValidationAlert(validation) {
    const alertDiv = document.getElementById('validationAlert');
    
    if (!validation.isValid && validation.suggestion) {
      alertDiv.className = 'validation-alert warning';
      alertDiv.innerHTML = '⚠️ ' + validation.suggestion;
      alertDiv.classList.remove('hidden');
    } else if (validation.isValid) {
      alertDiv.className = 'validation-alert valid';
      alertDiv.innerHTML = '✓ Filament profile found and validated';
      alertDiv.classList.remove('hidden');
      // Auto-hide success messages after 3 seconds
      setTimeout(() => {
        if (alertDiv.classList.contains('valid')) {
          alertDiv.classList.add('hidden');
        }
      }, 3000);
    } else {
      alertDiv.classList.add('hidden');
    }
  },