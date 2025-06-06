document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for main navigation links
    document.querySelectorAll('nav a:not(.tab-link)').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // About page tab functionality
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            // Remove active class from all links and panels
            tabLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked link and corresponding panel
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            const panelId = link.getAttribute('aria-controls');
            document.getElementById(panelId).classList.add('active');
        });
    });
});