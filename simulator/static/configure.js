function loadConfigure() {
    const specificModeOptions = document.getElementById('specific-mode-options');
    const imagingMode = document.getElementById('configure-imaging-mode');
    const spectroscopyMode = document.getElementById('configure-spectroscopy-mode');
    const formElementsToDisable = specificModeOptions.querySelectorAll('input, select');
    // Function to enable or disable spectroscopy mode form elements
    function toggleFormElements() {
        formElementsToDisable.forEach((element) => {
            element.disabled = !spectroscopyMode.checked;
        });
    }

    // Initial state
    toggleFormElements();

    console.log("This is Called")

    // Listen for spectroscopy Mode change
    imagingMode?.addEventListener('change', toggleFormElements);
    spectroscopyMode?.addEventListener('change', toggleFormElements);
}
