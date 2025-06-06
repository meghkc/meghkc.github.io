document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for main navigation links
    document.querySelectorAll('nav a:not(.tab-link):not(.nested-tab-link)').forEach(anchor => {
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

    // Main tab functionality (for About, Publications, Research)
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all main links and panels
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

            // Ensure nested tabs are initialized if Research Outreach is selected
            const nestedTabLinks = document.querySelectorAll('.nested-tab-link');
            const nestedTabPanels = document.querySelectorAll('.nested-tab-panel');
            if (nestedTabLinks.length > 0) {
                nestedTabLinks.forEach(l => {
                    if (l.classList.contains('active')) {
                        const nestedPanelId = l.getAttribute('aria-controls');
                        document.getElementById(nestedPanelId).classList.add('active');
                    }
                });
            }
        });
    });

    // Nested tab functionality (for Research Outreach sub-sections)
    const nestedTabLinks = document.querySelectorAll('.nested-tab-link');
    const nestedTabPanels = document.querySelectorAll('.nested-tab-panel');

    nestedTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Find the closest nested-tab-content to scope the operation
            const nestedTabContent = link.closest('.nested-tab-content');
            const siblingLinks = nestedTabContent.parentElement.querySelectorAll('.nested-tab-link');
            const siblingPanels = nestedTabContent.querySelectorAll('.nested-tab-panel');

            // Remove active class from all sibling links and panels
            siblingLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            siblingPanels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked link and corresponding panel
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            const panelId = link.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
            } else {
                console.error(`Panel with ID ${panelId} not found.`);
            }
        });
    });
});