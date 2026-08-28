document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Toggle Logic ---
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    
    if(bgAudio && audioToggle) {
        audioToggle.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play();
                audioToggle.querySelector('.icon').textContent = '🔊';
            } else {
                bgAudio.pause();
                audioToggle.querySelector('.icon').textContent = '🔇';
            }
        });
    }

    // --- Navbar Fade on Scroll Logic ---
    let lastScrollY = window.scrollY;
    const navbar = document.getElementById('main-nav');
    
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                // Scrolling down and past 100px
                navbar.classList.add('hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('hidden');
            }
            
            lastScrollY = window.scrollY;
        });
    }

    // --- Unified Projects Filtering Logic (Desktop & Mobile Chips) ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const filterBtns = document.querySelectorAll('.nav-dropdown .filter-btn');
    const galleryItems = document.querySelectorAll('.main-projects-grid .gallery-item, .gallery-grid .gallery-item');

    function applyFilter(filterValue) {
        if (!galleryItems.length) return;

        // Update active class on chips
        filterChips.forEach(chip => {
            if (chip.getAttribute('data-filter') === filterValue) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Filter gallery items
        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Check URL hash on initial load
    if (window.location.hash && galleryItems.length > 0) {
        const hashFilter = window.location.hash.replace('#', '');
        applyFilter(hashFilter);
    }

    // Filter Chips Click
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = chip.getAttribute('data-filter');
            applyFilter(filterValue);
            history.replaceState(null, null, '#' + filterValue);
        });
    });

    // Dropdown Links Click
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterValue = btn.getAttribute('data-filter');
            if (window.location.pathname.includes('proyectos.html')) {
                e.preventDefault();
                applyFilter(filterValue);
                history.replaceState(null, null, '#' + filterValue);
            }
        });
    });
});

// MAP MODULE LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const mapData = {
        'bolivia': [
            { title: 'Edificio Los Pinos', year: '2023' },
            { title: 'Casa del Bosque', year: '2021' }
        ],
        'usa': [
            { title: 'Miami Office Tower', year: '2024' },
            { title: 'Texas Warehouse', year: '2022' }
        ],
        'india': [
            { title: 'New Delhi Tech Park', year: '2025' },
            { title: 'Mumbai Residence', year: '2020' }
        ]
    };

    const countryBtns = document.querySelectorAll('.country-btn');
    const mapMarkers = document.querySelectorAll('.map-marker');
    const resultsContainer = document.getElementById('map-results');

    if(countryBtns.length > 0 && resultsContainer) {
        
        // Ensure mapMarkers have correct transform-origin via JS for cross-browser SVG scale
        mapMarkers.forEach(marker => {
            const cx = marker.getAttribute('cx');
            const cy = marker.getAttribute('cy');
            marker.style.transformOrigin = `${cx}px ${cy}px`;
            
            // Allow clicking on marker directly
            marker.addEventListener('click', () => {
                const country = marker.id.split('-')[1];
                document.querySelector(`.country-btn[data-country="${country}"]`).click();
            });
        });

        countryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const country = btn.dataset.country;
                
                // Update buttons
                countryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update markers
                mapMarkers.forEach(marker => {
                    marker.classList.remove('active');
                    marker.classList.add('dimmed');
                });
                const activeMarker = document.getElementById('marker-' + country);
                if(activeMarker) {
                    activeMarker.classList.remove('dimmed');
                    activeMarker.classList.add('active');
                }

                // Update results with fade
                resultsContainer.classList.remove('show');
                
                setTimeout(() => {
                    const projects = mapData[country];
                    let htmlContent = '';
                    projects.forEach(p => {
                        htmlContent += `
                            <div class="project-card">
                                <h4>${p.title}</h4>
                                <p>Año: ${p.year}</p>
                            </div>
                        `;
                    });
                    
                    resultsContainer.innerHTML = htmlContent;
                    
                    // Force reflow
                    void resultsContainer.offsetWidth;
                    
                    resultsContainer.classList.add('show');
                }, 400);
            });
        });
    }
});


// GLOBAL AUDIO LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('nav-audio-toggle');
    
    if(audio && audioBtn) {
        const icon = audioBtn.querySelector('i');
        
        // Check local storage for playing state
        const isPlaying = localStorage.getItem('siteAudioPlaying') === 'true';
        const savedTime = localStorage.getItem('siteAudioTime');
        if(savedTime) { audio.currentTime = parseFloat(savedTime); }
        setInterval(() => { if(!audio.paused) localStorage.setItem('siteAudioTime', audio.currentTime); }, 500);
        
        if (isPlaying) {
            audio.play().catch(e => {
                // Autoplay blocked
                console.log("Autoplay blocked by browser.");
                localStorage.setItem('siteAudioPlaying', 'false');
                icon.className = 'fas fa-volume-mute';
            });
            icon.className = 'fas fa-volume-up';
        } else {
            icon.className = 'fas fa-volume-mute';
        }
        
        audioBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                icon.className = 'fas fa-volume-up';
                localStorage.setItem('siteAudioPlaying', 'true');
            } else {
                audio.pause();
                icon.className = 'fas fa-volume-mute';
                localStorage.setItem('siteAudioPlaying', 'false');
            }
        });
    }
});

// --- Fullscreen Mobile Overlay Menu Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = document.querySelectorAll('.overlay-menu-links a');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('is-open');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    function closeMenu() {
        if (mobileMenu) {
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }

    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
});
