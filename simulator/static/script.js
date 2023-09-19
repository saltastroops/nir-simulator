document.addEventListener('DOMContentLoaded', function () {
    var tabLinks = document.querySelectorAll('.nav-link');

    tabLinks.forEach(function (tabLink) {
        tabLink.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the default behavior of the link
            var targetTabId = this.getAttribute('href').substring(1); // Get the ID of the target tab
            var activeTabId = document.querySelector('.tab-pane.active').id; // Get the ID of the currently active tab

            // Handle tab display changes here
            console.log('Tab display changed to:', targetTabId);

            // Call your custom function or add event listeners here
            if (targetTabId === 'generate-tab') {
                // Call your function or add listeners specific to Configure Tab
                // Example: addEventListener logic

            } else if (targetTabId === 'configure-tab') {
                loadConfigure()
            } else if (targetTabId === 'exposure-tab') {
                loadExposure()
            }
        });
    });
});
