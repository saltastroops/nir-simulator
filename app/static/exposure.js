document.addEventListener('DOMContentLoaded', function () {
    // JavaScript to handle radio button change event
    const gainRadioButtons = document.querySelectorAll('input[name="gainRadio"]');
    const gainContentSections = document.querySelectorAll('.gain-content');

    gainRadioButtons.forEach((radio) => {
        radio.addEventListener('change', function () {
            const selectedSectionId = this.value;
            gainContentSections.forEach((section) => {
                if (section.id === selectedSectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
});
