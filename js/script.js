// Global variables
let profileSlideTimer;
let repositoryAutoScrollTimer; 
let isTouchDevice = false;

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
    
    // Initialize smooth scrolling for navigation
    initializeSmoothScrolling();
    
    // Initialize tab systems based on page type
    if (document.body.classList.contains('home-page')) {
        initializeHomepageTabs();
        initializeProfileSlideshow();
        
        // Initialize repository scroll with delay
        setTimeout(() => {
            initializeRepositoryScroll();
        }, 500);
        
        // Initialize research impact metrics and charts on homepage
        setTimeout(() => {
            initializeResearchImpactChart();
            initializeMetricsCounters();
        }, 1000);
        
    } else if (document.body.classList.contains('skills-awards-page')) {
        initializeSkillsAwardsTabs();
        
        // Initialize default active tab content
        const activeTab = document.querySelector('.tab-link.active[data-tab]');
        if (activeTab) {
            const panelId = activeTab.getAttribute('data-tab');
            if (panelId === 'skills-panel') {
                setTimeout(() => {
                    initializeSkillsCharts();
                    initializeProgressBars();
                }, 500);
            }
        }
    } else {
        // Initialize general tab functionality for other pages
        initializeGeneralTabs();
    }
    
    // Initialize project gallery slideshow
    initializeProjectGallerySlideshow();
    
    // Add touch event listeners for mobile
    if (isTouchDevice) {
        addTouchSupport();
    }
});

// Add touch support for mobile devices
function addTouchSupport() {
    // Add touch support for slideshow navigation
    const slideshow = document.querySelector('.profile-slideshow');
    if (slideshow) {
        let startX = 0;
        let endX = 0;
        
        slideshow.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });
        
        slideshow.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            handleSwipe(startX, endX);
        });
        
        function handleSwipe(startX, endX) {
            const threshold = 50; // Minimum swipe distance
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    const nextBtn = document.querySelector('.slideshow-nav-right');
                    if (nextBtn) nextBtn.click();
                } else {
                    // Swipe right - previous slide
                    const prevBtn = document.querySelector('.slideshow-nav-left');
                    if (prevBtn) prevBtn.click();
                }
            }
        }
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('nav a:not(.tab-link):not(.nested-tab-link)').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Homepage tab functionality
function initializeHomepageTabs() {
    const homeTabLinks = document.querySelectorAll('.about-tabs .tab-link');
    const homeTabPanels = document.querySelectorAll('.tab-content .tab-panel');

    homeTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all homepage tabs
            homeTabLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            homeTabPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            
            // Get panel ID
            let panelId = link.getAttribute('href');
            if (panelId && panelId.startsWith('#')) {
                panelId = panelId.substring(1);
            } else {
                panelId = link.getAttribute('aria-controls');
            }
            
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
                
                // Initialize tab-specific content
                setTimeout(() => {
                    if (panelId === 'project-gallery-panel') {
                        initializeProjectGallerySlideshow();
                    }
                }, 100);
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
        
        radarCtx.chart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Programming', 'GIS & Mapping', 'ML/DL', 'Transportation Modeling', 'Project Management', 'Data Analysis'],
                datasets: [{
                    label: 'Skill Level',
                    data: [3.5, 4, 3, 4, 4, 3.5],
                    backgroundColor: 'rgba(0, 102, 204, 0.2)',
                    borderColor: 'rgba(0, 102, 204, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 102, 204, 1)',
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
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(0, 102, 204, 0.1)' }
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
        
        expCtx.chart = new Chart(expCtx, {
            type: 'bar',
            data: {
                labels: ['Python', 'R', 'GAMS', 'Gurobi', 'GIS Tools', 'ML/DL'],
                datasets: [{
                    label: 'Years of Experience',
                    data: [3.5, 3, 4, 4, 6, 3],
                    backgroundColor: [
                        'rgba(0, 102, 204, 0.8)',
                        'rgba(77, 166, 255, 0.8)',
                        'rgba(0, 102, 204, 0.6)',
                        'rgba(77, 166, 255, 0.6)',
                        'rgba(0, 102, 204, 0.9)',
                        'rgba(77, 166, 255, 0.7)'
                    ],
                    borderColor: 'rgba(0, 102, 204, 1)',
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
                        ticks: { stepSize: 1, color: '#666' },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { maxRotation: 45, color: '#666' },
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
            
            window.citationsChartInstance = new Chart(citationsCtx, {
                type: 'line',
                data: {
                    labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                    datasets: [{
                        label: 'Citations',
                        data: [0, 5, 12, 25, 38, 48, 56],
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
                            max: 60,
                            grid: { color: 'rgba(0, 102, 204, 0.1)' },
                            ticks: { color: '#666' }
                        },
                        x: {
                            grid: { color: 'rgba(0, 102, 204, 0.1)' },
                            ticks: { color: '#666' }
                        }
                    }
                }
            });
        }
        
        // Publications Chart
        const publicationsCtx = document.getElementById('publicationsChart');
        if (publicationsCtx) {
            if (window.publicationsChartInstance) {
                window.publicationsChartInstance.destroy();
            }
            
            window.publicationsChartInstance = new Chart(publicationsCtx, {
                type: 'bar',
                data: {
                    labels: ['2019', '2020', '2021', '2024', '2025'],
                    datasets: [{
                        label: 'Publications',
                        data: [1, 2, 3, 4, 5],
                        backgroundColor: 'rgba(77, 166, 255, 0.8)',
                        borderColor: '#4da6ff',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                            max: 5,
                            grid: { color: 'rgba(77, 166, 255, 0.1)' },
                            ticks: { color: '#666', stepSize: 3 }
                        },
                        x: {
                            grid: { color: 'rgba(77, 166, 255, 0.1)' },
                            ticks: { color: '#666' }
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