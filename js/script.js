document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for main navigation links
    document.querySelectorAll('nav a:not(.tab-link):not(.nested-tab-link)').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
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
                    const nestedPanel = document.getElementById(nestedPanelId);
                    if (nestedPanel) {
                        nestedPanel.classList.add('active');
                    }
                }
            }
        });
    });

    // Nested tab functionality (for Research Outreach sub-sections)
    const nestedTabLinks = document.querySelectorAll('.nested-tab-link');
    nestedTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Scope to the parent #outreach-panel
            const parentPanel = link.closest('#outreach-panel');
            if (!parentPanel) {
                console.error('Parent panel #outreach-panel not found for link:', link);
                return;
            }

            // Find sibling links and panels within the same #outreach-panel
            const siblingLinks = parentPanel.querySelectorAll('.nested-tab-link');
            const siblingPanels = parentPanel.querySelectorAll('.nested-tab-panel');

            // Debug: Log the found elements
            console.log('Sibling links found:', siblingLinks.length);
            console.log('Sibling panels found:', siblingPanels.length);

            // Remove active class from all sibling links and panels
            siblingLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            siblingPanels.forEach(p => {
                p.classList.remove('active');
                console.log('Removed active from panel:', p.id);
            });

            // Add active class to clicked link and corresponding panel
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            const panelId = link.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
                console.log('Added active to panel:', panelId);
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

    // Slideshow functionality
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide img');
    const description = document.querySelector('.slide-description');

    function showSlide(index) {
        if (index >= slides.length) slideIndex = 0;
        if (index < 0) slideIndex = slides.length - 1;
        slides.forEach(slide => slide.style.display = 'none');
        slides[slideIndex].style.display = 'block';
        description.textContent = slides[slideIndex].getAttribute('data-description');
    }

    document.querySelector('.prev').addEventListener('click', () => {
        slideIndex--;
        showSlide(slideIndex);
    });

    document.querySelector('.next').addEventListener('click', () => {
        slideIndex++;
        showSlide(slideIndex);
    });

    // Show the first slide on load
    showSlide(slideIndex);

   // Profile slideshow functionality
    let profileSlideIndex = 0;
    const profileSlides = document.querySelectorAll('.profile-slideshow .slide-img');
    const slideshowInterval = 3000; // Change image every 3 seconds

    function showProfileSlide(index) {
        if (index >= profileSlides.length) profileSlideIndex = 0;
        if (index < 0) profileSlideIndex = profileSlides.length - 1;
        profileSlides.forEach(slide => slide.style.display = 'none');
        profileSlides[profileSlideIndex].style.display = 'block';
    }

    function startProfileSlideshow() {
        showProfileSlide(profileSlideIndex);
        profileSlideIndex++;
        setTimeout(startProfileSlideshow, slideshowInterval);
    }

    // Start the slideshow on page load
    startProfileSlideshow(); 
});
