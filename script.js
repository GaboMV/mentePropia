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

// MAP MODULE LOGIC: 3D RELIEF, ZOOM & ACTIVE COUNTRY HIGHLIGHT
document.addEventListener('DOMContentLoaded', () => {
    const mapData = {
        'bolivia': [
            { title: 'Edificio Los Pinos', year: '2023' },
            { title: 'Casa del Bosque', year: '2021' },
            { title: 'Torre Camila Interiores', year: '2024' }
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

    const zoomConfig = {
        'bolivia': { x: 280, y: 380, scale: 2.4, countryIds: ['bolivia'] },
        'usa': { x: 200, y: 200, scale: 2.2, countryIds: ['usa', 'alaska'] },
        'india': { x: 680, y: 280, scale: 2.4, countryIds: ['india'] }
    };

    const countryBtns = document.querySelectorAll('.country-btn[data-country]');
    const resetBtns = document.querySelectorAll('#btn-reset-map, #floating-reset-btn');
    const mapMarkers = document.querySelectorAll('.map-marker');
    const resultsContainer = document.getElementById('map-results');
    const mapContainer = document.querySelector('.map-container');
    const mapViewport = document.getElementById('map-viewport');
    const bgHitbox = document.querySelector('.map-bg-hitbox');

    let currentCountry = null;

    if (mapViewport && resultsContainer) {
        
        function selectCountry(country) {
            // Toggle off if already active
            if (currentCountry === country) {
                resetMap();
                return;
            }

            const config = zoomConfig[country];
            if (!config) return;

            currentCountry = country;

            // 1. Calculate zoom and translation to center point (475, 310)
            const centerX = 475;
            const centerY = 310;
            const tx = centerX - config.scale * config.x;
            const ty = centerY - config.scale * config.y;

            mapViewport.style.transform = `translate(${tx}px, ${ty}px) scale(${config.scale})`;
            if (mapContainer) mapContainer.classList.add('zoomed');

            // 2. Turn clicked country path(s) JET BLACK
            document.querySelectorAll('.map-viewport path').forEach(p => {
                p.classList.remove('country-active');
            });
            config.countryIds.forEach(id => {
                const countryEl = document.getElementById(id);
                if (countryEl) countryEl.classList.add('country-active');
            });

            // 3. Update markers state
            mapMarkers.forEach(marker => {
                marker.classList.remove('active');
                marker.classList.add('dimmed');
            });
            const activeMarker = document.getElementById('marker-' + country);
            if (activeMarker) {
                activeMarker.classList.remove('dimmed');
                activeMarker.classList.add('active');
            }

            // 4. Update controls buttons
            document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.querySelector(`.country-btn[data-country="${country}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            // 5. Update project results
            resultsContainer.classList.remove('show');
            setTimeout(() => {
                const projects = mapData[country] || [];
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
                void resultsContainer.offsetWidth; // Force reflow
                resultsContainer.classList.add('show');
            }, 350);
        }

        function resetMap() {
            currentCountry = null;

            // 1. Reset zoom & pan
            mapViewport.style.transform = 'translate(0px, 0px) scale(1)';
            if (mapContainer) mapContainer.classList.remove('zoomed');

            // 2. Remove black country highlights
            document.querySelectorAll('.map-viewport path.country-active').forEach(p => {
                p.classList.remove('country-active');
            });

            // 3. Reset markers
            mapMarkers.forEach(marker => {
                marker.classList.remove('active');
                marker.classList.remove('dimmed');
            });

            // 4. Reset buttons
            document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));

            // 5. Reset results text
            resultsContainer.classList.remove('show');
            setTimeout(() => {
                resultsContainer.innerHTML = '<p style="text-align:center; color:#666; width:100%;">Selecciona un país para ver los proyectos.</p>';
                void resultsContainer.offsetWidth;
                resultsContainer.classList.add('show');
            }, 250);
        }

        // Attach listeners to Country Buttons
        countryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCountry(btn.dataset.country);
            });
        });

        // Attach listeners to Reset Buttons
        resetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetMap();
            });
        });

        // Attach listeners to Markers
        mapMarkers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                const country = marker.dataset.country || marker.id.replace('marker-', '');
                selectCountry(country);
            });
        });

        // Attach listeners directly to clickable country paths
        document.querySelectorAll('.interactive-country').forEach(path => {
            path.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = path.id;
                if (id === 'bolivia') selectCountry('bolivia');
                else if (id === 'usa' || id === 'alaska') selectCountry('usa');
                else if (id === 'india') selectCountry('india');
            });
        });

        // Clicking background hitbox resets zoom when zoomed
        if (bgHitbox) {
            bgHitbox.addEventListener('click', () => {
                if (currentCountry) resetMap();
            });
        }
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

// DYNAMIC PROJECT DETAIL CONTROLLER & SELECTION PERSISTENCE
document.addEventListener('DOMContentLoaded', () => {
    // 1. Capture click on ANY project card to persist selection across navigation
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const imgEl = item.querySelector('img');
            const titleEl = item.querySelector('.project-title');
            const metaEl = item.querySelector('.project-meta');
            const imgSrc = (imgEl && (imgEl.getAttribute('src') || imgEl.src)) || item.dataset.img;
            const titleText = (titleEl && titleEl.textContent.trim()) || item.dataset.title;
            const metaText = (metaEl && metaEl.textContent.trim()) || item.dataset.meta;

            if (imgSrc) sessionStorage.setItem('currentProjectImg', imgSrc);
            if (titleText) sessionStorage.setItem('currentProjectTitle', titleText);
            if (metaText) sessionStorage.setItem('currentProjectMeta', metaText);
        }
    });

    // 2. Initialize project detail view dynamically
    const deepNav = document.querySelector('.project-deep-nav');
    if (deepNav) {
        const baseImg = deepNav.querySelector('.project-base-img');
        const params = new URLSearchParams(window.location.search);

        const imgSrc = params.get('img') || sessionStorage.getItem('currentProjectImg') || 'assets/PROJECT1.png';
        const title = params.get('title') || sessionStorage.getItem('currentProjectTitle');
        const meta = params.get('meta') || sessionStorage.getItem('currentProjectMeta');

        if (title) {
            document.title = `MENTE PROPIA | ${title}`;
        }

        if (baseImg) {
            // Apply chosen project image
            if (imgSrc) {
                baseImg.src = imgSrc;
            }

            const syncImageProps = () => {
                const activeSrc = baseImg.currentSrc || baseImg.getAttribute('src') || baseImg.src || imgSrc;
                if (activeSrc) {
                    deepNav.style.setProperty('--bg-img', `url('${activeSrc}')`);
                }

                // Detect natural aspect ratio: if vertical (height > width), adapt layout
                if (baseImg.naturalHeight && baseImg.naturalWidth) {
                    if (baseImg.naturalHeight > baseImg.naturalWidth) {
                        deepNav.classList.add('is-vertical');
                    } else {
                        deepNav.classList.remove('is-vertical');
                    }
                }
            };

            if (baseImg.complete && baseImg.naturalWidth) {
                syncImageProps();
            } else {
                baseImg.addEventListener('load', syncImageProps);
            }

            // Sync sub-page links with current project parameters
            document.querySelectorAll('.deep-nav-item').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.includes('?')) {
                    const activeSrc = baseImg.getAttribute('src') || imgSrc;
                    link.setAttribute('href', `${href}?img=${encodeURIComponent(activeSrc)}&title=${encodeURIComponent(title || '')}`);
                }
            });
        }
    }

    // 3. For subpages, preserve back-navigation link to the selected project
    const backToProject = document.querySelector('a[href*="proyecto-detalle.html"]');
    if (backToProject && !backToProject.closest('.gallery-grid')) {
        const params = new URLSearchParams(window.location.search);
        const savedImg = params.get('img') || sessionStorage.getItem('currentProjectImg');
        const savedTitle = params.get('title') || sessionStorage.getItem('currentProjectTitle');
        if (savedImg && !backToProject.getAttribute('href').includes('?')) {
            backToProject.setAttribute('href', `proyecto-detalle.html?img=${encodeURIComponent(savedImg)}&title=${encodeURIComponent(savedTitle || '')}`);
        }
    }
});

// ==========================================================================
// 4. DAY / NIGHT BACKGROUND VIDEO SWITCHER (index.html)
// ==========================================================================
function initDayNightVideo() {
    const heroVideo = document.getElementById('hero-video') || document.querySelector('.hero-video');
    const ambientVideo = document.getElementById('hero-video-ambient') || document.querySelector('.hero-video-ambient');
    if (!heroVideo) return;

    // Synchronize playback between main video and ambient background video
    if (ambientVideo) {
        heroVideo.addEventListener('play', () => {
            if (ambientVideo.paused) ambientVideo.play().catch(() => {});
        });
        heroVideo.addEventListener('pause', () => {
            ambientVideo.pause();
        });
        heroVideo.addEventListener('seeked', () => {
            ambientVideo.currentTime = heroVideo.currentTime;
        });
        heroVideo.addEventListener('timeupdate', () => {
            if (Math.abs(heroVideo.currentTime - ambientVideo.currentTime) > 0.35) {
                ambientVideo.currentTime = heroVideo.currentTime;
            }
        });
    }

    function applyVideoForTime(hourOverride) {
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');
        let isDay = true;

        if (themeParam === 'night') {
            isDay = false;
        } else if (themeParam === 'day') {
            isDay = true;
        } else {
            const hour = (typeof hourOverride === 'number') ? hourOverride : new Date().getHours();
            // Daytime: 06:00 to 18:59 (6 AM to 6:59 PM). Nighttime: 19:00 to 05:59 (7 PM to 5:59 AM)
            isDay = hour >= 6 && hour < 19;
        }

        const targetSrc = isDay ? 'assets/video.mp4' : 'assets/fondo noche.mp4';

        const source = heroVideo.querySelector('source') || document.getElementById('hero-video-source');
        if (source) {
            const currentSrc = decodeURIComponent(source.getAttribute('src') || '');
            if (currentSrc !== targetSrc) {
                source.setAttribute('src', targetSrc);
                heroVideo.load();
                heroVideo.play().catch(e => console.log('Background video autoplay handled:', e));
            }
        }

        if (ambientVideo) {
            const ambientSource = ambientVideo.querySelector('source') || document.getElementById('hero-video-ambient-source');
            if (ambientSource) {
                const currentAmbientSrc = decodeURIComponent(ambientSource.getAttribute('src') || '');
                if (currentAmbientSrc !== targetSrc) {
                    ambientSource.setAttribute('src', targetSrc);
                    ambientVideo.load();
                    ambientVideo.play().catch(() => {});
                }
            }
        }
    }

    applyVideoForTime();

    // Global hook for manual testing or verification (e.g. window.setThemeVideo('night'))
    window.setThemeVideo = (modeOrHour) => {
        if (modeOrHour === 'day') applyVideoForTime(12);
        else if (modeOrHour === 'night') applyVideoForTime(22);
        else if (typeof modeOrHour === 'number') applyVideoForTime(modeOrHour);
    };
}
document.addEventListener('DOMContentLoaded', initDayNightVideo);

// ==========================================================================
// 5. DYNAMIC IN-PAGE STAGE DETAIL SECTION (Gallery Slider & Ficha Técnica)
// ==========================================================================
function initStageDetailSection() {
    const stageSection = document.getElementById('stage-detail-section');
    if (!stageSection) return;

    const params = new URLSearchParams(window.location.search);
    const currentProjectImg = params.get('img') || sessionStorage.getItem('currentProjectImg') || 'assets/PROJECT1.png';
    const currentProjectTitle = params.get('title') || sessionStorage.getItem('currentProjectTitle') || 'CASA VB';
    const altProjectImg = currentProjectImg.includes('PROJECT1') ? 'assets/PROJECT2.png' : 'assets/PROJECT1.png';

    // Modular Stage Galleries Data Structure (easily customizable per stage)
    const stageGalleries = {
        'idea-fuerza': {
            name: 'Idea Fuerza',
            badge: 'IDEA FUERZA CONCEPTUAL',
            images: [currentProjectImg, altProjectImg],
            description: 'Conceptualización y premisas fundamentales del diseño arquitectónico.'
        },
        'bocetos': {
            name: 'Bocetos',
            badge: 'BOCETOS Y ESQUEMAS',
            images: [currentProjectImg, altProjectImg],
            description: 'Primeros trazos, volumetría y exploración morfológica inicial.'
        },
        'planos': {
            name: 'Planos',
            badge: 'PLANOS Y CORTES TÉCNICOS',
            images: [currentProjectImg, altProjectImg],
            description: 'Planos arquitectónicos detallados, secciones y elevaciones técnicas.'
        },
        '3d-render': {
            name: '3D Render',
            badge: 'VISUALIZACIONES 3D',
            images: [currentProjectImg, altProjectImg],
            description: 'Modelado tridimensional e iluminación fotométrica de alta precisión.'
        },
        'preparacion-terreno': {
            name: 'Preparación del terreno',
            badge: 'PREPARACIÓN Y MOVIMIENTO DE TIERRAS',
            images: [currentProjectImg, altProjectImg],
            description: 'Topografía, excavaciones, replanteo y consolidación del suelo.'
        },
        'obra': {
            name: 'Obra',
            badge: 'OBRA EN CONSTRUCCIÓN',
            images: [currentProjectImg, altProjectImg],
            description: 'Proceso constructivo y ejecución de obra in situ.'
        }
    };

    // Update Project Title in Ficha Técnica
    const projectTitleEl = document.getElementById('stageProjectTitle');
    if (projectTitleEl) {
        projectTitleEl.textContent = currentProjectTitle;
    }

    // Adaptive technical sheet data based on selected project
    if (currentProjectTitle.toUpperCase().includes('TORRE CAMILA')) {
        const premiosEl = document.getElementById('stagePremiosText');
        if (premiosEl) premiosEl.textContent = 'Mención de Honor Bienal de Arquitectura Boliviana - 2024';
        const tTerreno = document.getElementById('techTerreno');
        if (tTerreno) tTerreno.textContent = '2400 m2';
        const tConstruida = document.getElementById('techConstruida');
        if (tConstruida) tConstruida.textContent = '14.250 m2';
        const tCubierta = document.getElementById('techCubierta');
        if (tCubierta) tCubierta.textContent = '1.850 m2';
        const tInicio = document.getElementById('techInicio');
        if (tInicio) tInicio.textContent = '2021';
        const tConclusion = document.getElementById('techConclusion');
        if (tConclusion) tConclusion.textContent = '2024';
    }

    let activeStageKey = 'obra'; // Default stage requested by user
    let currentSlideIdx = 0;

    const galleryImg = document.getElementById('stage-gallery-img');
    const badgeLabel = document.getElementById('stageBadgeLabel');
    const currentIdxEl = document.getElementById('sliderCurrentIdx');
    const totalCountEl = document.getElementById('sliderTotalCount');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const tabBtns = document.querySelectorAll('.stage-tab-btn');
    const deepNavItems = document.querySelectorAll('.deep-nav-item[data-stage]');

    function updateSliderView(fade = true) {
        const stageData = stageGalleries[activeStageKey] || stageGalleries['obra'];
        const images = stageData.images || [currentProjectImg, altProjectImg];

        if (currentSlideIdx >= images.length) currentSlideIdx = 0;
        if (currentSlideIdx < 0) currentSlideIdx = images.length - 1;

        if (badgeLabel) badgeLabel.textContent = stageData.badge;
        if (currentIdxEl) currentIdxEl.textContent = currentSlideIdx + 1;
        if (totalCountEl) totalCountEl.textContent = images.length;

        if (galleryImg) {
            if (fade) {
                galleryImg.style.opacity = '0';
                setTimeout(() => {
                    galleryImg.src = images[currentSlideIdx];
                    galleryImg.style.opacity = '1';
                }, 160);
            } else {
                galleryImg.src = images[currentSlideIdx];
                galleryImg.style.opacity = '1';
            }
        }
    }

    function selectStage(stageKey, scrollToSection = false) {
        if (!stageGalleries[stageKey]) return;
        activeStageKey = stageKey;
        currentSlideIdx = 0;

        // Update tabs active state
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-stage') === stageKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        updateSliderView(true);

        if (scrollToSection) {
            stageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Slider Prev / Next controls
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSlideIdx--;
            updateSliderView(true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSlideIdx++;
            updateSliderView(true);
        });
    }

    // Stage Tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const stage = btn.getAttribute('data-stage');
            selectStage(stage, false);
        });
    });

    // Fragmented Image Nav Items (clicking opens and scrolls to the dynamic section)
    deepNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const stage = item.getAttribute('data-stage');
            selectStage(stage, true);
        });
    });

    // Check URL hash on initial load
    if (window.location.hash) {
        const hashStage = window.location.hash.replace('#', '').toLowerCase();
        if (stageGalleries[hashStage]) {
            selectStage(hashStage, true);
        } else {
            updateSliderView(false);
        }
    } else {
        updateSliderView(false);
    }
}
document.addEventListener('DOMContentLoaded', initStageDetailSection);

