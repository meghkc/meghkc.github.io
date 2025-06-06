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
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
            }

            // Initialize nested tabs if Research Outreach is selected
            if (panelId === 'outreach-panel') {
                const defaultNestedTab = document.querySelector('#outreach-panel .nested-tab-link.active');
                if (defaultNestedTab) {
                    const nestedPanelId = defaultNestedTab.getAttribute('aria-controls');
                    document.getElementById(nestedPanelId).classList.add('active');
                }
            }
        });
    });

    // Nested tab functionality (for Research Outreach sub-sections)
    const nestedTabLinks = document.querySelectorAll('.nested-tab-link');
    nestedTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Scope to the specific nested-tab-content
            const nestedTabContent = link.closest('.nested-tab-content');
            if (!nestedTabContent) return;

            const nestedTabs = nestedTabContent.previousElementSibling;
            const siblingLinks = nestedTabs.querySelectorAll('.nested-tab-link');
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
                console.error(`Nested panel with ID ${panelId} not found.`);
            }
        });
    });

    // Initial load: Trigger the default main tab to ensure nested tabs are initialized
    const defaultMainTab = document.querySelector('.tab-link.active');
    if (defaultMainTab) {
        defaultMainTab.click();
    }
});