document.addEventListener('DOMContentLoaded', function () {
    const specificModeOptions = document.getElementById('specific-mode-options');
    const imagingMode = document.getElementById('configuration_options-0');
    const spectroscopyMode = document.getElementById('configuration_options-1');
    const formElementsToDisable = specificModeOptions.querySelectorAll('input, select');
    // Function to enable or disable spectroscopy mode form elements
    function toggleFormElements() {
        formElementsToDisable.forEach((element) => {
            element.disabled = !spectroscopyMode.checked;
        });
    }

    // Initial state
    toggleFormElements();

    // Listen for spectroscopy Mode change
    imagingMode.addEventListener('change', toggleFormElements);
    spectroscopyMode.addEventListener('change', toggleFormElements);
});
