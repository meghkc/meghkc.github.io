// Global variables
let profileSlideTimer;
let repositoryAutoScrollTimer; 
let isTouchDevice = false;

// --- Utility & Enhancement Functions (added to prevent ReferenceErrors) ---
// Smooth scrolling for internal anchor links (graceful no-op if not present)
function initializeSmoothScrolling() {
    try {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', e => {
                const targetId = link.getAttribute('href');
                // Ignore empty or just '#'
                if (!targetId || targetId === '#') return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', targetId);
                }
            });
        });
    } catch (err) {
        console.warn('Smooth scrolling initialization failed:', err);
    }
}

// Basic touch support enhancements (swipe detection for repository carousel / slideshows)
function addTouchSupport() {
    try {
        const carousels = document.querySelectorAll('.repositories-scroll, .profile-slideshow, .project-gallery');
        carousels.forEach(carousel => {
            let startX = 0; let deltaX = 0; let isDown = false;
            const threshold = 40;
            carousel.addEventListener('touchstart', e => {
                if (!e.touches || !e.touches.length) return;
                startX = e.touches[0].clientX; isDown = true; deltaX = 0;
            }, { passive: true });
            carousel.addEventListener('touchmove', e => {
                if (!isDown || !e.touches || !e.touches.length) return;
                deltaX = e.touches[0].clientX - startX;
            }, { passive: true });
            carousel.addEventListener('touchend', () => {
                if (!isDown) return; isDown = false;
                if (Math.abs(deltaX) > threshold) {
                    const leftBtn = carousel.querySelector('.slideshow-nav-left, .prev');
                    const rightBtn = carousel.querySelector('.slideshow-nav-right, .next');
                    if (deltaX < 0 && rightBtn) rightBtn.click(); // swipe left -> next
                    if (deltaX > 0 && leftBtn) leftBtn.click(); // swipe right -> prev
                }
            });
        });
    } catch (err) {
        console.warn('Touch support initialization failed:', err);
    }
}

// Detect touch device
function detectTouchDevice() {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
}

// Main DOMContentLoaded Event - KEEP ONLY THIS ONE
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing page...');
    
    // Detect touch device first
    detectTouchDevice();
    
    initializeSmoothScrolling();

    if (document.body.classList.contains('home-page')) {
        initializeHomepageTabs();
        initializeProfileSlideshow();
        setTimeout(() => initializeRepositoryScroll(), 500);
        setTimeout(() => { initializeResearchImpactChart(); initializeMetricsCounters(); }, 1000);
        initializePackageShowcase();
    } else if (document.body.classList.contains('skills-awards-page')) {
        initializeSkillsAwardsTabs();
        const activeTab = document.querySelector('.tab-link.active[data-tab]');
        if (activeTab && activeTab.getAttribute('data-tab') === 'skills-panel') {
            setTimeout(() => { initializeSkillsCharts(); initializeProgressBars(); }, 500);
        }
    } else {
        initializeGeneralTabs();
    }

    initializeProjectGallerySlideshow();
    if (isTouchDevice) { addTouchSupport(); }

    // Responsive animated titles adjustment
    adjustAnimatedTitles();
    window.addEventListener('resize', debounce(adjustAnimatedTitles, 120));

    // Initialize typewriter titles
    initializeTypewriterTitles();

    // Fallback: if research impact charts expected but not created after 2s, force init
    setTimeout(() => {
        if (document.body.classList.contains('home-page')) {
            if (!window.citationsChartInstance && document.getElementById('citationsChart')) {
                console.warn('Fallback initializing research impact charts');
                initializeResearchImpactChart();
            }
        }
        if (document.body.classList.contains('skills-awards-page')) {
            const radar = document.getElementById('skillsRadarChart');
            if (radar && !radar.chart) {
                console.warn('Fallback initializing skills charts');
                initializeSkillsCharts();
            }
        }
    }, 2000);
});

// Debounce utility
function debounce(fn, wait) {
    let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
}

// Adjust animated titles layout based on width
function adjustAnimatedTitles() {
    const container = document.querySelector('.animated-titles');
    if (!container) return;
    container.classList.remove('titles-compact','titles-medium');
    // Measure total width of inline children
    const children = Array.from(container.querySelectorAll('.title-text, .title-separator'));
    const totalTextWidth = children.reduce((sum, el)=> sum + el.getBoundingClientRect().width, 0) + (children.length * 6);
    const available = container.getBoundingClientRect().width;
    if (available === 0) return;
    const ratio = totalTextWidth / available;
    if (ratio > 1.45) {
        container.classList.add('titles-compact'); // vertical stack
    } else if (ratio > 1.05) {
        container.classList.add('titles-medium'); // smaller inline style
    }
}

// Typewriter animation for animated titles
function initializeTypewriterTitles() {
    const container = document.querySelector('.animated-titles');
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Collect existing role texts
    const roleNodes = Array.from(container.querySelectorAll('.title-text'));
    const roles = roleNodes.map(n => n.textContent.trim()).filter(Boolean);
    if (!roles.length) return;

    // Clean existing structure & build typewriter shell
    container.innerHTML = '';
    const liveSpan = document.createElement('span');
    liveSpan.className = 'typewriter-text';
    liveSpan.setAttribute('aria-live','polite');
    // Assign initial role index attribute for color mapping
    liveSpan.setAttribute('data-role','0');
    const caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    container.appendChild(liveSpan);
    container.appendChild(caret);

    if (prefersReducedMotion) {
        // Static fallback with separators
        liveSpan.textContent = roles.join(' | ');
        caret.style.display = 'none';
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let typing = true;
    const typingSpeed = 70; // ms per character
    const eraseSpeed = 45;
    const holdDelay = 1400; // pause after full word

    function typeLoop() {
        const current = roles[roleIndex];
        if (typing) {
            if (charIndex <= current.length) {
                liveSpan.textContent = current.slice(0, charIndex);
                charIndex++;
                setTimeout(typeLoop, typingSpeed);
            } else {
                typing = false;
                setTimeout(typeLoop, holdDelay);
            }
        } else { // erasing
            if (charIndex > 0) {
                charIndex--;
                liveSpan.textContent = current.slice(0, charIndex);
                setTimeout(typeLoop, eraseSpeed);
            } else {
                typing = true;
                roleIndex = (roleIndex + 1) % roles.length;
                // Update role attribute for new color
                liveSpan.setAttribute('data-role', String(roleIndex));
                setTimeout(typeLoop, typingSpeed);
            }
        }
    }
    typeLoop();
}

// Homepage tabs (re-added minimal version)
function initializeHomepageTabs() {
    const tabLinks = document.querySelectorAll('.about-tabs .tab-link');
    const tabPanels = document.querySelectorAll('.tab-content .tab-panel');
    if (!tabLinks.length) return;
    tabLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            tabLinks.forEach(l => { l.classList.remove('active'); l.setAttribute('aria-selected','false'); });
            tabPanels.forEach(p => p.classList.remove('active'));
            link.classList.add('active');
            link.setAttribute('aria-selected','true');
            let id = link.getAttribute('href');
            if (id && id.startsWith('#')) id = id.slice(1);
            const panel = document.getElementById(id);
            if (panel) {
                panel.classList.add('active');
                setTimeout(() => {
                    if (id === 'project-gallery-panel') initializeProjectGallerySlideshow();
                    if (id === 'research-impact') { initializeResearchImpactChart(); initializeMetricsCounters(); }
                }, 150);
            }
        });
    });
}

// Skills & Awards page tab functionality
function initializeSkillsAwardsTabs() {
    const skillsTabLinks = document.querySelectorAll('.tab-link[data-tab]');
    const skillsTabPanels = document.querySelectorAll('.tab-panel[id]');

    skillsTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all skills tabs
            skillsTabLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            skillsTabPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            
            const panelId = link.getAttribute('data-tab');
            const panel = document.getElementById(panelId);

            if (panel) {
                panel.classList.add('active');
                
                // Initialize tab-specific content
                setTimeout(() => {
                    if (panelId === 'skills-panel') {
                        initializeSkillsCharts();
                        initializeProgressBars();
                    } else if (panelId === 'research-metrics') {
                        initializeResearchImpactChart();
                        initializeMetricsCounters();
                        setTimeout(() => {
                            if (document.getElementById('conferenceMap')) {
                                initializeConferenceMap();
                            }
                        }, 300);
                    } else if (panelId === 'awards-panel') {
                        initializeAwardsTimeline();
                    }
                }, 100);
            }
        });
    });
}

// General tab functionality for other pages
function initializeGeneralTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all tabs
            tabLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            
            let panelId = link.getAttribute('aria-controls') || link.getAttribute('data-tab');
            const panel = document.getElementById(panelId);

            if (panel) {
                panel.classList.add('active');
                
                // Handle nested tabs for research outreach
                if (panelId === 'outreach-panel') {
                    initializeNestedTabs();
                }
            }
        });
    });
    
    // Initialize nested tabs
    initializeNestedTabs();
}

// Nested tab functionality for research outreach
function initializeNestedTabs() {
    const nestedTabLinks = document.querySelectorAll('.nested-tab-link');
    
    nestedTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const parentPanel = link.closest('#outreach-panel');
            if (!parentPanel) return;

            const siblingLinks = parentPanel.querySelectorAll('.nested-tab-link');
            const siblingPanels = parentPanel.querySelectorAll('.nested-tab-panel');

            // Remove active from siblings
            siblingLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            siblingPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            
            const panelId = link.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// Homepage profile slideshow
function initializeProfileSlideshow() {
    const slideshow = document.querySelector('.profile-slideshow');
    if (!slideshow) return;
    
    const slides = slideshow.querySelectorAll('.slide-img');
    const caption = slideshow.querySelector('.slideshow-caption');
    const indicators = slideshow.querySelectorAll('.slideshow-indicator');
    const prevBtn = slideshow.querySelector('.slideshow-nav-left');
    const nextBtn = slideshow.querySelector('.slideshow-nav-right');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        // Update caption
        if (caption && slides[index]) {
            caption.textContent = slides[index].getAttribute('data-caption') || '';
        }
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    function startAutoSlide() {
        if (profileSlideTimer) clearInterval(profileSlideTimer);
        profileSlideTimer = setInterval(nextSlide, 4000);
    }
    
    function stopAutoSlide() {
        if (profileSlideTimer) {
            clearInterval(profileSlideTimer);
            profileSlideTimer = null;
        }
    }
    
    // Initialize
    showSlide(0);
    startAutoSlide();
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Pause on hover
    slideshow.addEventListener('mouseenter', stopAutoSlide);
    slideshow.addEventListener('mouseleave', startAutoSlide);
}

// Repository scroll functionality - FIXED VERSION
function initializeRepositoryScroll() {
    const scrollContainer = document.querySelector('.repositories-scroll');
    const leftBtn = document.querySelector('.scroll-left');
    const rightBtn = document.querySelector('.scroll-right');
    const indicators = document.querySelectorAll('.scroll-navigation .indicator');
    
    if (!scrollContainer) {
        console.log('Repository scroll container not found');
        return;
    }

    const repositoryCards = scrollContainer.querySelectorAll('.repository-card');
    const totalCards = repositoryCards.length;
    
    if (totalCards === 0) {
        console.log('No repository cards found');
        return;
    }

    console.log(`Found ${totalCards} repository cards`);

    // Calculate card dimensions
    const cardWidth = 350; // Fixed width
    const cardGap = 24; // Gap between cards
    const totalCardWidth = cardWidth + cardGap;
    
    let currentIndex = 0;
    const maxIndex = Math.max(0, totalCards - 1);

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function scrollToPosition(index, smooth = true) {
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        
        const scrollPosition = index * totalCardWidth;
        
        if (smooth) {
            scrollContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        } else {
            scrollContainer.scrollLeft = scrollPosition;
        }
        
        currentIndex = index;
        updateIndicators();
        console.log(`Scrolled to index ${index}, position ${scrollPosition}px`);
    }

    function scrollLeft() {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
        scrollToPosition(newIndex);
        resetAutoScroll();
    }

    function scrollRight() {
        const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        scrollToPosition(newIndex);
        resetAutoScroll();
    }

    function startAutoScroll() {
        if (repositoryAutoScrollTimer) clearInterval(repositoryAutoScrollTimer);
        repositoryAutoScrollTimer = setInterval(() => {
            scrollRight();
        }, 6000);
    }

    function stopAutoScroll() {
        if (repositoryAutoScrollTimer) {
            clearInterval(repositoryAutoScrollTimer);
            repositoryAutoScrollTimer = null;
        }
    }

    function resetAutoScroll() {
        stopAutoScroll();
        setTimeout(startAutoScroll, 2000); // Restart after 2 seconds
    }

    // Event listeners
    if (leftBtn) {
        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollLeft();
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollRight();
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            if (index <= maxIndex) {
                scrollToPosition(index);
                resetAutoScroll();
            }
        });
    });

    // Manual scroll detection
    let scrollTimeout;
    scrollContainer.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const scrollPosition = scrollContainer.scrollLeft;
            const newIndex = Math.round(scrollPosition / totalCardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
                currentIndex = newIndex;
                updateIndicators();
            }
        }, 150);
    });

    // Pause on hover
    scrollContainer.addEventListener('mouseenter', stopAutoScroll);
    scrollContainer.addEventListener('mouseleave', () => {
        setTimeout(startAutoScroll, 1000);
    });

    // Initialize
    updateIndicators();
    scrollToPosition(0, false);
    setTimeout(startAutoScroll, 3000);
    
    console.log('Repository scroll initialized successfully');
}

// Project gallery slideshow
function initializeProjectGallerySlideshow() {
    const slides = document.querySelectorAll('.slide img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const slideDescription = document.querySelector('.slide-description');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        if (slideDescription && slides[index]) {
            const description = slides[index].getAttribute('data-description');
            slideDescription.textContent = description || '';
        }
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Initialize
    showSlide(currentSlide);
    
    // Event listeners
    if (nextBtn) {
        nextBtn.removeEventListener('click', nextSlide);
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.removeEventListener('click', prevSlide);
        prevBtn.addEventListener('click', prevSlide);
    }
}

// Skills charts - SINGLE VERSION
function initializeSkillsCharts() {
    console.log('Initializing skills charts...');
    
    // Skills Radar Chart
    const radarCtx = document.getElementById('skillsRadarChart');
    if (radarCtx) {
        if (radarCtx.chart) radarCtx.chart.destroy();

        const darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const radarLine = darkTheme ? 'rgba(128,201,255,1)' : 'rgba(0, 102, 204, 1)';
        const radarFill = darkTheme ? 'rgba(128,201,255,0.22)' : 'rgba(0, 102, 204, 0.2)';
        const radarPoint = radarLine;
        const radarGrid = darkTheme ? 'rgba(128,201,255,0.25)' : 'rgba(0, 102, 204, 0.1)';
        const radarAngle = darkTheme ? 'rgba(128,201,255,0.35)' : 'rgba(0,102,204,0.25)';
        const radarTick = darkTheme ? '#d4ebf9' : '#666';
        const radarFont = darkTheme ? '#e6f4ff' : '#003355';
        
        radarCtx.chart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Programming', 'GIS & Mapping', 'ML/DL', 'Transportation Modeling', 'Project Management', 'Data Analysis'],
                datasets: [{
                    label: 'Skill Level',
                    data: [3.5, 4, 3, 4, 4, 3.5],
                    backgroundColor: radarFill,
                    borderColor: radarLine,
                    borderWidth: 2,
                    pointBackgroundColor: radarPoint,
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1, color: radarTick, backdropColor: 'transparent', showLabelBackdrop: false },
                        grid: { color: radarGrid },
                        angleLines: { color: radarAngle },
                        pointLabels: { color: radarFont, font: { size: 12 } }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Experience Chart
    const expCtx = document.getElementById('experienceChart');
    if (expCtx) {
        if (expCtx.chart) expCtx.chart.destroy();

        const darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const axisTickColor = darkTheme ? '#d4ebf9' : '#666';
        const axisBorderColor = darkTheme ? 'rgba(128,201,255,0.55)' : 'rgba(0,102,204,0.4)';
        const barPalette = darkTheme ? [
            'rgba(128,201,255,0.85)',
            'rgba(77,166,255,0.75)',
            'rgba(128,201,255,0.65)',
            'rgba(77,166,255,0.6)',
            'rgba(128,201,255,0.9)',
            'rgba(77,166,255,0.7)'
        ] : [
            'rgba(0, 102, 204, 0.8)',
            'rgba(77, 166, 255, 0.8)',
            'rgba(0, 102, 204, 0.6)',
            'rgba(77, 166, 255, 0.6)',
            'rgba(0, 102, 204, 0.9)',
            'rgba(77, 166, 255, 0.7)'
        ];
        
        expCtx.chart = new Chart(expCtx, {
            type: 'bar',
            data: {
                labels: ['Python', 'R', 'GAMS', 'Gurobi', 'GIS Tools', 'ML/DL'],
                datasets: [{
                    label: 'Years of Experience',
                    data: [3.5, 3, 4, 4, 6, 3],
                    backgroundColor: barPalette,
                    borderColor: darkTheme ? '#80c9ff' : 'rgba(0, 102, 204, 1)',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 6,
                        ticks: { stepSize: 1, color: axisTickColor },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { maxRotation: 45, color: axisTickColor },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// Progress bars animation
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
        bar.style.width = '0%';
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.getAttribute('data-width');
                
                setTimeout(() => {
                    progressBar.style.width = targetWidth + '%';
                }, 300);
                
                observer.unobserve(progressBar);
            }
        });
    }, { threshold: 0.3 });
    
    progressBars.forEach(bar => observer.observe(bar));
}

// Research impact charts - SINGLE VERSION
function initializeResearchImpactChart() {
    console.log('Initializing research impact charts...');
    
    setTimeout(() => {
        // Citations Chart
        const citationsCtx = document.getElementById('citationsChart');
        if (citationsCtx) {
            if (window.citationsChartInstance) {
                window.citationsChartInstance.destroy();
            }

            // Axis styling based on current theme
            const darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            const axisTickColor = darkTheme ? '#d4ebf9' : '#444';
            const axisGridColor = darkTheme ? 'rgba(128,201,255,0.22)' : 'rgba(0,102,204,0.12)';
            const axisBorderColor = darkTheme ? 'rgba(128,201,255,0.55)' : 'rgba(0,102,204,0.4)';
            
            window.citationsChartInstance = new Chart(citationsCtx, {
                type: 'line',
                data: {
                    labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                    datasets: [{
                        label: 'Citations',
                        data: [0, 5, 12, 25, 38, 48, 57],
                        borderColor: '#0066cc',
                        backgroundColor: 'rgba(0, 102, 204, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#0066cc',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 102, 204, 0.9)',
                            titleColor: 'white',
                            bodyColor: 'white'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 58,
                            ticks: { stepSize: 1, color: axisTickColor },
                            grid: { display: false },
                            border: { color: axisBorderColor }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: axisTickColor },
                            border: { color: axisBorderColor }
                        }
                    }
                }
            });
        }
        
        // Publications Chart with toggle (cumulative vs per-year)
        const publicationsCtx = document.getElementById('publicationsChart');
        if (publicationsCtx) {
            const yearLabels = ['2019', '2020', '2021', '2024', '2025'];
            // Cumulative counts (replace with actual if needed)
            const cumulative = [1, 2, 3, 4, 6];

            const darkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            const axisTickColor = darkTheme ? '#d4ebf9' : '#444';
            const axisGridColor = darkTheme ? 'rgba(128,201,255,0.22)' : 'rgba(77,166,255,0.12)';
            const axisBorderColor = darkTheme ? 'rgba(128,201,255,0.55)' : 'rgba(77,166,255,0.45)';

            if (window.publicationsChartInstance) {
                window.publicationsChartInstance.destroy();
            }

            window.publicationsChartInstance = new Chart(publicationsCtx, {
                type: 'bar',
                data: {
                    labels: yearLabels,
                    datasets: [{
                        label: 'Publications (cumulative)',
                        data: cumulative,
                        backgroundColor: 'rgba(77, 166, 255, 0.8)',
                        borderColor: '#4da6ff',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 600 },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(77, 166, 255, 0.9)',
                            titleColor: 'white',
                            bodyColor: 'white'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...cumulative),
                            grid: { display: false },
                            ticks: { color: axisTickColor, precision: 0 },
                            border: { color: axisBorderColor }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: axisTickColor },
                            border: { color: axisBorderColor }
                        }
                    }
                }
            });
        }
    }, 200);
}

// Metrics counters animation
function initializeMetricsCounters() {
    const counters = document.querySelectorAll('.metric-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        counter.textContent = '0';
        setTimeout(updateCounter, 300);
    });
}

// Awards timeline animation
function initializeAwardsTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-50px)';
        item.style.transition = 'all 0.6s ease';
    });
    
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
            
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(0, 102, 204, 0.15)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0) scale(1)';
                this.style.boxShadow = 'none';
            });
            
        }, index * 150);
    });
}

// Conference map initialization
function initializeConferenceMap() {
    const mapContainer = document.getElementById('conferenceMap');
    if (!mapContainer) return;

    const conferenceData = [
        {
            title: "ASCE International Conference on Transportation Development",
            location: "Arizona, USA",
            year: "2025",
            lat: 33.4484,
            lng: -112.0740,
            type: "other",
            count: 1
        },
        {
            title: "Transportation Research Board (TRB) Annual Meeting",
            location: "Washington DC",
            year: "2022-2025",
            lat: 38.9072,
            lng: -77.0369,
            type: "trb",
            count: 6
        },
        {
            title: "ITE Mountain District Annual Meeting",
            location: "Big Sky, Montana",
            year: "2024",
            lat: 45.2619,
            lng: -111.3080,
            type: "ite",
            count: 1
        },
        {
            title: "ITE Mountain District Annual Meeting",
            location: "St. George, Utah",
            year: "2023",
            lat: 37.0965,
            lng: -113.5684,
            type: "ite",
            count: 1
        },
        {
            title: "USU Student Research Symposium & Research Week",
            location: "Logan, Utah",
            year: "2023",
            lat: 41.7370,
            lng: -111.8338,
            type: "other",
            count: 2
        }
    ];

    const map = L.map('conferenceMap').setView([39.8283, -98.5795], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    const icons = {
        trb: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }),
        ite: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #28a745; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        }),
        other: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #0066cc; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        })
    };

    conferenceData.forEach(conference => {
        const icon = icons[conference.type] || icons.other;
        
        const popupContent = `
            <div class="popup-content">
                <h6>${conference.title}</h6>
                <p><strong>📍 Location:</strong> ${conference.location}</p>
                <p><strong>📅 Year:</strong> <span class="year">${conference.year}</span></p>
                <p><strong>🎯 Presentations:</strong> ${conference.count}</p>
            </div>
        `;

        L.marker([conference.lat, conference.lng], { icon: icon })
            .addTo(map)
            .bindPopup(popupContent)
            .on('mouseover', function(e) {
                this.openPopup();
            });
    });
}

// Package showcase copy functionality
function initializePackageShowcase() {
    console.log('Initializing package showcase...');
    
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.getAttribute('data-command');
            
            // Copy to clipboard
            navigator.clipboard.writeText(command).then(() => {
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = '✓';
                this.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 2000);
                
                console.log('Copied to clipboard:', command);
            }).catch(err => {
                console.error('Failed to copy:', err);
                
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = command;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = '✓';
                this.classList.add('copied');
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 2000);
            });
        });
    });
}

// THEME TOGGLE + SCROLL REVEAL ENHANCEMENTS
(function() {
    const root = document.documentElement;
    const btn = document.querySelector('.theme-toggle');
    const STORAGE_KEY = 'pref-theme';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            if (btn) btn.textContent = '☀️';
            adaptChartsForTheme('dark');
        } else {
            root.removeAttribute('data-theme');
            if (btn) btn.textContent = '🌙';
            adaptChartsForTheme('light');
        }
    }

    // Detect stored preference or system
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        applyTheme(stored);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }

    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next === 'dark' ? 'dark' : 'light');
            localStorage.setItem(STORAGE_KEY, next === 'dark' ? 'dark' : 'light');
        });
    }

    // Scroll reveal with stagger only if motion allowed
    if (!prefersReducedMotion) {
        const revealNodes = Array.from(document.querySelectorAll('.reveal-init, h2.section-heading, h3'));
        const baseDelay = 90;
        let batchIndex = 0;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.style.transitionDelay = (batchIndex * baseDelay) + 'ms';
                    el.classList.add('reveal-in');
                    observer.unobserve(el);
                    batchIndex++;
                }
            });
        }, { threshold: 0.18 });
        revealNodes.forEach(el => { if (!el.classList.contains('reveal-in')) { el.classList.add('reveal-init'); observer.observe(el); } });
    }

    // Dark mode chart adaptation
    function adaptChartsForTheme(theme) {
        const dark = theme === 'dark';
        const axisColor = dark ? '#b7d4e8' : '#666';
    const gridLight = dark ? 'rgba(128,201,255,0.22)' : 'rgba(0,102,204,0.12)';
    const gridAlt = dark ? 'rgba(128,201,255,0.25)' : 'rgba(77,166,255,0.12)';
        const lineColor = dark ? '#4da6ff' : '#0066cc';
        const fillColor = dark ? 'rgba(77,166,255,0.18)' : 'rgba(0,102,204,0.1)';
        const tooltipBg = dark ? 'rgba(15,42,60,0.92)' : 'rgba(0,102,204,0.9)';
        const barColor = dark ? 'rgba(128,201,255,0.8)' : 'rgba(77,166,255,0.8)';
        const barBorder = dark ? '#80c9ff' : '#4da6ff';
    const axisBorder = dark ? 'rgba(128,201,255,0.55)' : 'rgba(0,102,204,0.4)';

        function updateChart(inst) {
            if (!inst) return;
            if (inst.config.type === 'line') {
                const ds = inst.config.data.datasets[0];
                ds.borderColor = lineColor;
                ds.backgroundColor = fillColor;
                ds.pointBackgroundColor = lineColor;
            }
            if (inst.config.type === 'bar') {
                const ds = inst.config.data.datasets[0];
                ds.backgroundColor = barColor;
                ds.borderColor = barBorder;
            }
            const scales = inst.options.scales || {};
            if (scales.y) { 
                if (inst.canvas && (inst.canvas.id === 'citationsChart' || inst.canvas.id === 'publicationsChart')) {
                    scales.y.grid.display = false;
                } else {
                    scales.y.grid.color = inst.config.type === 'line' ? gridLight : gridAlt; 
                }
                scales.y.ticks.color = axisColor; 
                if (!scales.y.border) scales.y.border = {}; 
                scales.y.border.color = axisBorder; 
            }
            if (scales.x) { 
                if (inst.canvas && (inst.canvas.id === 'citationsChart' || inst.canvas.id === 'publicationsChart')) {
                    scales.x.grid.display = false;
                } else {
                    scales.x.grid.color = inst.config.type === 'line' ? gridLight : gridAlt; 
                }
                scales.x.ticks.color = axisColor; 
                if (!scales.x.border) scales.x.border = {}; 
                scales.x.border.color = axisBorder; 
            }
            if (inst.options.plugins && inst.options.plugins.tooltip) {
                inst.options.plugins.tooltip.backgroundColor = tooltipBg;
                inst.options.plugins.tooltip.titleColor = '#fff';
                inst.options.plugins.tooltip.bodyColor = '#fff';
            }
            inst.update('none');
        }
        updateChart(window.citationsChartInstance);
        updateChart(window.publicationsChartInstance);
            // Rebuild skills charts to fully apply dark styles (plugins & radial scale)
            if (document.body.classList.contains('skills-awards-page')) {
                initializeSkillsCharts();
            }
    }
})();

// COLLAPSIBLES + METRICS LIVE REGION + CHART REFRESH
(function(){
  const STORAGE_KEY_PREFIX = 'collapse-state:';
  const collapsibleSections = document.querySelectorAll('[data-collapsible]');
  collapsibleSections.forEach(section => {
    const toggle = section.querySelector('.collapsible-toggle');
    const content = section.querySelector('.collapsible-content');
    if (!toggle || !content) return;
    const id = toggle.id || section.id || Math.random().toString(36).slice(2);
    const storageKey = STORAGE_KEY_PREFIX + id;
    const saved = localStorage.getItem(storageKey);
    if (saved === 'collapsed') {
      toggle.setAttribute('aria-expanded','false');
      content.classList.add('is-collapsed');
      toggle.textContent = '▸';
    } else {
      toggle.setAttribute('aria-expanded','true');
      toggle.textContent = '▾';
    }
    toggle.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        toggle.setAttribute('aria-expanded','false');
        content.classList.add('is-collapsed');
        toggle.textContent = '▸';
        localStorage.setItem(storageKey,'collapsed');
      } else {
        toggle.setAttribute('aria-expanded','true');
        content.classList.remove('is-collapsed');
        toggle.textContent = '▾';
        localStorage.setItem(storageKey,'expanded');
      }
    });
  });

  // Metrics live region announcements once counters finish
  const metricsLive = document.getElementById('metrics-live');
  if (metricsLive) {
    const counters = document.querySelectorAll('.metric-number[data-target]');
    const observer = new MutationObserver(() => {
      // When last counter matches its target values, announce
      let allDone = true;
      counters.forEach(c => { if (c.textContent.replace(/[,]/g,'') !== c.getAttribute('data-target')) allDone = false; });
      if (allDone) {
        metricsLive.textContent = 'Research impact metrics updated.';
        observer.disconnect();
      }
    });
    counters.forEach(c => observer.observe(c, { childList:true }));
  }

  // Chart refresh button appears only if reduced motion is set (so user can manually trigger)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    const refreshBtn = document.querySelector('.chart-refresh-btn');
    if (refreshBtn) {
      refreshBtn.hidden = false;
      refreshBtn.addEventListener('click', () => {
        if (typeof initializeResearchImpactChart === 'function') {
          initializeResearchImpactChart();
          refreshBtn.textContent = '✓';
          setTimeout(()=> refreshBtn.textContent = '↻', 1500);
        }
      });
    }
  }
})();