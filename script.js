// ==========================================================================
// MENTE PROPIA - CORE APPLICATION SCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Behavior & Fade on Scroll ---
    let lastScrollY = window.scrollY;
    const navbar = document.getElementById('main-nav');
    
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });

        // Home navbar touch / click toggle support
        if (navbar.classList.contains('navbar-home')) {
            navbar.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-links a') && !e.target.closest('.nav-search-input')) {
                    navbar.classList.toggle('header-revealed');
                }
            });
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target)) {
                    navbar.classList.remove('header-revealed');
                }
            });
        }
    }

    // --- Unified Projects Filtering Logic (Desktop & Mobile Chips) ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const filterBtns = document.querySelectorAll('.nav-dropdown .filter-btn');
    const galleryItems = document.querySelectorAll('.main-projects-grid .gallery-item, .gallery-grid .gallery-item');

    function applyFilter(filterValue) {
        if (!galleryItems.length) return;

        filterChips.forEach(chip => {
            if (chip.getAttribute('data-filter') === filterValue) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (window.location.hash && galleryItems.length > 0) {
        const hashFilter = window.location.hash.replace('#', '');
        applyFilter(hashFilter);
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = chip.getAttribute('data-filter');
            applyFilter(filterValue);
            history.replaceState(null, null, '#' + filterValue);
        });
    });

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

// ==========================================================================
// 1. HEADER GLOBAL PROJECT SEARCH BAR (SHOWS ALL PROJECTS & INSTANT SEARCH)
// ==========================================================================
function initHeaderSearch() {
    const searchInputs = document.querySelectorAll('.nav-search-input, .mobile-search-input');
    const resultsContainers = document.querySelectorAll('.nav-search-results');
    
    // Complete catalog of all projects in the portal
    const projectsCatalog = [
        {
            title: 'PARQUE URBANO NUBE',
            shortTitle: 'PARQUE URBANO',
            meta: '2025 | SC',
            category: 'concursos',
            categoryLabel: 'Concursos',
            img: 'assets/PROJECT2.png',
            desc: 'Propuesta paisajística contemporánea y pabellones de sombra bioclimáticos en Santa Cruz.'
        },
        {
            title: 'TORRE CAMILA',
            shortTitle: 'TORRE CAMILA',
            meta: '2024 | LP',
            category: 'futuristico',
            categoryLabel: 'Futurístico',
            img: 'assets/PROJECT2.png',
            desc: 'Torre corporativa y residencial vanguardista en San Pedro, La Paz.'
        },
        {
            title: 'CASA VB',
            shortTitle: 'CASA VB',
            meta: '2022 | SC',
            category: 'casas',
            categoryLabel: 'Casas',
            img: 'assets/PROJECT1.png',
            desc: 'Residencia unifamiliar con arquitectura bioclimática y voladizos en Santa Cruz.'
        },
        {
            title: 'EDIFICIO QUARTIER',
            shortTitle: 'EDIFICIO QUARTIER',
            meta: '2023 | SC',
            category: 'futuristico',
            categoryLabel: 'Futurístico',
            img: 'assets/PROJECT1.png',
            desc: 'Complejo residencial y comercial con diseño arquitectónico contemporáneo en Santa Cruz.'
        },
        {
            title: 'CENTRO CULTURAL ILLIMANI',
            shortTitle: 'CENTRO CULTURAL',
            meta: '2024 | LP',
            category: 'culturales',
            categoryLabel: 'Culturales',
            img: 'assets/PROJECT2.png',
            desc: 'Espacio multifuncional para difusión artística y auditorio acústico en La Paz.'
        },
        {
            title: 'CASA JACARANDÁ',
            shortTitle: 'CASA JACARANDÁ',
            meta: '2023 | CBBA',
            category: 'casas',
            categoryLabel: 'Casas',
            img: 'assets/PROJECT1.png',
            desc: 'Vivienda sostenible con integración de patios interiores y vegetación en Cochabamba.'
        },
        {
            title: 'EDIFICIO LOS PINOS',
            shortTitle: 'EDIFICIO LOS PINOS',
            meta: '2023 | LP',
            category: 'edificios',
            categoryLabel: 'Edificios',
            img: 'assets/PROJECT1.png',
            desc: 'Edificio residencial con terrazas escalonadas y confort térmico en La Paz.'
        },
        {
            title: 'CONDOMINIO LAS PALMAS',
            shortTitle: 'CONDOMINIO LAS PALMAS',
            meta: '2024 | SC',
            category: 'casas',
            categoryLabel: 'Casas',
            img: 'assets/PROJECT1.png',
            desc: 'Complejo residencial horizontal con enfoque biofílico en Santa Cruz.'
        },
        {
            title: 'CASA MIRADOR LOS ANDES',
            shortTitle: 'MIRADOR LOS ANDES',
            meta: '2023 | CHILE',
            category: 'casas',
            categoryLabel: 'Chile',
            img: 'assets/PROJECT2.png',
            desc: 'Residencia en ladera con vistas panorámicas a la cordillera de Los Andes, Santiago.'
        },
        {
            title: 'RESIDENCIA LAGUNA BRAVA',
            shortTitle: 'LAGUNA BRAVA',
            meta: '2024 | URUGUAY',
            category: 'casas',
            categoryLabel: 'Uruguay',
            img: 'assets/PROJECT1.png',
            desc: 'Vivienda minimalista con integración lacustre en Punta del Este, Uruguay.'
        }
    ];

    if (!searchInputs.length) return;

    function normalizeText(str) {
        if (!str) return '';
        return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    }

    function renderResults(matches, targetBox, queryStr) {
        if (!targetBox) return;

        if (matches.length === 0) {
            targetBox.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <span>No se encontraron proyectos para "${queryStr}"</span>
                </div>
            `;
        } else {
            let html = '';
            matches.forEach(p => {
                const detailUrl = `proyecto-detalle.html?img=${encodeURIComponent(p.img)}&title=${encodeURIComponent(p.title)}&meta=${encodeURIComponent(p.meta)}`;
                html += `
                    <a href="${detailUrl}" class="search-result-item">
                        <img src="${p.img}" alt="${p.title}" class="search-result-thumb" onerror="this.src='assets/fondo.jpg'">
                        <div class="search-result-meta">
                            <span class="search-result-title">${p.title}</span>
                            <span class="search-result-sub">${p.meta} · ${p.categoryLabel}</span>
                        </div>
                        <span class="search-result-badge"><i class="fas fa-arrow-right"></i></span>
                    </a>
                `;
            });
            targetBox.innerHTML = html;
        }
        targetBox.classList.add('show');
    }

    searchInputs.forEach(input => {
        const wrap = input.closest('.nav-search-wrap');
        const resultsBox = wrap ? wrap.querySelector('.nav-search-results') : null;

        // Show all projects on focus/click
        input.addEventListener('focus', () => {
            const rawVal = input.value.trim();
            const normVal = normalizeText(rawVal);
            if (!normVal) {
                renderResults(projectsCatalog, resultsBox, '');
            } else {
                const matches = projectsCatalog.filter(p => {
                    const haystack = normalizeText(`${p.title} ${p.shortTitle || ''} ${p.meta} ${p.category} ${p.categoryLabel} ${p.desc}`);
                    return haystack.includes(normVal);
                });
                renderResults(matches, resultsBox, rawVal);
            }
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            if (resultsBox && !resultsBox.classList.contains('show')) {
                const rawVal = input.value.trim();
                const normVal = normalizeText(rawVal);
                const matches = !normVal ? projectsCatalog : projectsCatalog.filter(p => {
                    const haystack = normalizeText(`${p.title} ${p.shortTitle || ''} ${p.meta} ${p.category} ${p.categoryLabel} ${p.desc}`);
                    return haystack.includes(normVal);
                });
                renderResults(matches, resultsBox, rawVal);
            }
        });

        input.addEventListener('input', (e) => {
            const rawVal = e.target.value.trim();
            const query = normalizeText(rawVal);
            
            // If on proyectos.html, filter grid cards live
            const galleryItems = document.querySelectorAll('.main-projects-grid .gallery-item, .gallery-grid .gallery-item');
            if (galleryItems.length > 0 && window.location.pathname.includes('proyectos.html')) {
                galleryItems.forEach(item => {
                    const titleEl = item.querySelector('.project-title');
                    const metaEl = item.querySelector('.project-meta');
                    const itemText = normalizeText(((titleEl ? titleEl.textContent : '') + ' ' + (metaEl ? metaEl.textContent : '') + ' ' + item.className));
                    if (!query || itemText.includes(query)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }

            if (!resultsBox) return;

            if (!query) {
                renderResults(projectsCatalog, resultsBox, '');
                return;
            }

            const matches = projectsCatalog.filter(p => {
                const haystack = normalizeText(`${p.title} ${p.shortTitle || ''} ${p.meta} ${p.category} ${p.categoryLabel} ${p.desc}`);
                return haystack.includes(query);
            });

            renderResults(matches, resultsBox, rawVal);
        });

        // Enter key navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = normalizeText(input.value.trim());
                if (!query) return;
                const match = projectsCatalog.find(p => {
                    const haystack = normalizeText(`${p.title} ${p.shortTitle || ''} ${p.meta} ${p.category} ${p.categoryLabel}`);
                    return haystack.includes(query);
                });
                if (match) {
                    window.location.href = `proyecto-detalle.html?img=${encodeURIComponent(match.img)}&title=${encodeURIComponent(match.title)}&meta=${encodeURIComponent(match.meta)}`;
                } else if (!window.location.pathname.includes('proyectos.html')) {
                    window.location.href = `proyectos.html`;
                }
            } else if (e.key === 'Escape') {
                if (resultsBox) resultsBox.classList.remove('show');
            }
        });
    });

    // Close results dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-search-wrap') && !e.target.closest('.mobile-search-box')) {
            resultsContainers.forEach(box => box.classList.remove('show'));
        }
    });
}
document.addEventListener('DOMContentLoaded', initHeaderSearch);

// ==========================================================================
// 2. MAP MODULE: SOUTH AMERICA (BOLIVIA, CHILE, URUGUAY) - SOBER & JITTER-FREE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Projects in South America: Bolivia, Chile, Uruguay
    const mapData = {
        'bolivia': [
            { title: 'Torre Camila PB', city: 'La Paz, Bolivia', year: '2024' },
            { title: 'Casa VB', city: 'Santa Cruz, Bolivia', year: '2022' },
            { title: 'Casa Jacarandá', city: 'Cochabamba, Bolivia', year: '2023' },
            { title: 'Edificio Quartier', city: 'Santa Cruz, Bolivia', year: '2023' },
            { title: 'Parque Urbano Nube', city: 'Santa Cruz, Bolivia', year: '2025' }
        ],
        'chile': [
            { title: 'Casa Mirador Los Andes', city: 'Santiago, Chile', year: '2023' },
            { title: 'Pabellón Vitacura', city: 'Santiago, Chile', year: '2024' },
            { title: 'Refugio Costero Zapallar', city: 'Valparaíso, Chile', year: '2022' }
        ],
        'uruguay': [
            { title: 'Residencia Laguna Brava', city: 'Punta del Este, Uruguay', year: '2024' },
            { title: 'Pabellón Carrasco', city: 'Montevideo, Uruguay', year: '2023' },
            { title: 'Casa Médano', city: 'José Ignacio, Uruguay', year: '2022' }
        ]
    };

    // Default transform centers strictly on South America in the 950x620 SVG viewBox
    const defaultTransform = 'translate(5px, -358px) scale(1.65)';

    const zoomConfig = {
        'bolivia': { tx: -260, ty: -700, scale: 2.7, countryIds: ['bolivia'] },
        'chile': { tx: -245, ty: -850, scale: 2.8, countryIds: ['chile'] },
        'uruguay': { tx: -370, ty: -880, scale: 2.9, countryIds: ['uruguay'] }
    };

    const countryBtns = document.querySelectorAll('.country-btn[data-country]');
    const resetBtns = document.querySelectorAll('#btn-reset-map, #floating-reset-btn');
    const mapMarkers = document.querySelectorAll('.map-marker');
    const resultsContainer = document.getElementById('map-results');
    const mapContainer = document.querySelector('.map-container');
    const mapViewport = document.getElementById('map-viewport');
    const bgHitbox = document.querySelector('.map-bg-hitbox');

    let currentSelection = 'bolivia';

    if (mapViewport && resultsContainer) {
        // Set default view centered strictly on South America
        mapViewport.style.transform = defaultTransform;

        function renderProjects(key) {
            const projects = mapData[key] || mapData['bolivia'] || [];
            let htmlContent = '';
            projects.forEach(p => {
                htmlContent += `
                    <div class="project-card">
                        <h4>${p.title}</h4>
                        <p>${p.city} · Año: ${p.year}</p>
                    </div>
                `;
            });
            resultsContainer.innerHTML = htmlContent;
            void resultsContainer.offsetWidth;
            resultsContainer.classList.add('show');
        }

        // Initial render with Bolivia projects
        renderProjects('bolivia');

        function selectLocation(locKey) {
            const config = zoomConfig[locKey];
            if (!config) return;

            currentSelection = locKey;

            // 1. Smooth zoom & pan to selected South American location
            mapViewport.style.transform = `translate(${config.tx}px, ${config.ty}px) scale(${config.scale})`;
            if (mapContainer) mapContainer.classList.add('zoomed');

            // 2. Turn highlighted country to sober architectural charcoal
            document.querySelectorAll('.map-viewport path').forEach(p => {
                p.classList.remove('country-active');
            });
            config.countryIds.forEach(id => {
                const countryEl = document.getElementById(id);
                if (countryEl) countryEl.classList.add('country-active');
            });

            // 3. Update markers state (sober, clean, no position displacement)
            mapMarkers.forEach(marker => {
                marker.classList.remove('active');
                marker.classList.add('dimmed');
            });
            const activeMarker = document.getElementById('marker-' + locKey) || document.getElementById('marker-bolivia');
            if (activeMarker) {
                activeMarker.classList.remove('dimmed');
                activeMarker.classList.add('active');
            }

            // 4. Update controls buttons
            document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.querySelector(`.country-btn[data-country="${locKey}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            // 5. Update project results
            resultsContainer.classList.remove('show');
            setTimeout(() => {
                renderProjects(locKey);
            }, 250);
        }

        function resetMap() {
            currentSelection = null;

            // 1. Reset zoom & pan to South America center
            mapViewport.style.transform = defaultTransform;
            if (mapContainer) mapContainer.classList.remove('zoomed');

            // 2. Remove country highlights
            document.querySelectorAll('.map-viewport path.country-active').forEach(p => {
                p.classList.remove('country-active');
            });

            // 3. Reset markers to default state
            mapMarkers.forEach(marker => {
                marker.classList.remove('active');
                marker.classList.remove('dimmed');
            });
            const boliviaMarker = document.getElementById('marker-bolivia');
            if (boliviaMarker) boliviaMarker.classList.add('active');

            // 4. Reset buttons
            document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
            const boliviaBtn = document.querySelector('.country-btn[data-country="bolivia"]');
            if (boliviaBtn) boliviaBtn.classList.add('active');

            // 5. Render default projects
            resultsContainer.classList.remove('show');
            setTimeout(() => {
                renderProjects('bolivia');
            }, 200);
        }

        // Attach listeners to Country Buttons
        countryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectLocation(btn.dataset.country);
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
                const locKey = marker.dataset.country || marker.id.replace('marker-', '');
                selectLocation(locKey);
            });
        });

        // Click directly on interactive country paths (Bolivia, Chile, Uruguay)
        document.querySelectorAll('.interactive-country').forEach(path => {
            path.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = path.id;
                if (id === 'bolivia' || id === 'chile' || id === 'uruguay') {
                    selectLocation(id);
                }
            });
        });

        // Clicking background hitbox resets zoom when zoomed
        if (bgHitbox) {
            bgHitbox.addEventListener('click', () => {
                resetMap();
            });
        }
    }
});

// ==========================================================================
// 3. GLOBAL FLOATING AUDIO CONTROLLER (Bottom Right)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-audio');
    if (!audio) return;

    let audioBtn = document.getElementById('floating-audio-toggle') || document.querySelector('.floating-audio-btn');
    
    // Auto-create floating button if not present in the DOM
    if (!audioBtn) {
        audioBtn = document.createElement('button');
        audioBtn.id = 'floating-audio-toggle';
        audioBtn.className = 'floating-audio-btn';
        audioBtn.title = 'Activar / Desactivar Música';
        audioBtn.setAttribute('aria-label', 'Control de audio');
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        document.body.appendChild(audioBtn);
    }
    
    const icon = audioBtn.querySelector('i');
    
    function setPlayingState(playing) {
        if (playing) {
            audioBtn.classList.add('is-playing');
            if (icon) icon.className = 'fas fa-volume-up';
        } else {
            audioBtn.classList.remove('is-playing');
            if (icon) icon.className = 'fas fa-volume-mute';
        }
    }

    const isPlaying = localStorage.getItem('siteAudioPlaying') === 'true';
    const savedTime = localStorage.getItem('siteAudioTime');
    if (savedTime) { audio.currentTime = parseFloat(savedTime); }
    setInterval(() => { if (!audio.paused) localStorage.setItem('siteAudioTime', audio.currentTime); }, 500);
    
    if (isPlaying) {
        audio.play().then(() => {
            setPlayingState(true);
        }).catch(e => {
            console.log("Autoplay blocked by browser policy, awaiting interaction.");
            localStorage.setItem('siteAudioPlaying', 'false');
            setPlayingState(false);
        });
    } else {
        setPlayingState(false);
    }
    
    audioBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                setPlayingState(true);
                localStorage.setItem('siteAudioPlaying', 'true');
            }).catch(err => console.log('Audio playback failed:', err));
        } else {
            audio.pause();
            setPlayingState(false);
            localStorage.setItem('siteAudioPlaying', 'false');
        }
    });
});

// ==========================================================================
// 4. FULLSCREEN MOBILE OVERLAY MENU LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = document.querySelectorAll('.overlay-menu-links a');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('is-open');
            document.body.style.overflow = 'hidden';
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

// ==========================================================================
// 5. DYNAMIC PROJECT DETAIL CONTROLLER & SELECTION PERSISTENCE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
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
            if (imgSrc) {
                baseImg.src = imgSrc;
            }

            const syncImageProps = () => {
                const activeSrc = baseImg.currentSrc || baseImg.getAttribute('src') || baseImg.src || imgSrc;
                if (activeSrc) {
                    deepNav.style.setProperty('--bg-img', `url('${activeSrc}')`);
                }

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

            document.querySelectorAll('.deep-nav-item').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.includes('?')) {
                    const activeSrc = baseImg.getAttribute('src') || imgSrc;
                    link.setAttribute('href', `${href}?img=${encodeURIComponent(activeSrc)}&title=${encodeURIComponent(title || '')}`);
                }
            });
        }
    }

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
// 6. DAY / NIGHT BACKGROUND VIDEO SWITCHER (index.html)
// ==========================================================================
function initDayNightVideo() {
    const heroVideo = document.getElementById('hero-video') || document.querySelector('.hero-video');
    const ambientVideo = document.getElementById('hero-video-ambient') || document.querySelector('.hero-video-ambient');
    if (!heroVideo) return;

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

    window.setThemeVideo = (modeOrHour) => {
        if (modeOrHour === 'day') applyVideoForTime(12);
        else if (modeOrHour === 'night') applyVideoForTime(22);
        else if (typeof modeOrHour === 'number') applyVideoForTime(modeOrHour);
    };
}
document.addEventListener('DOMContentLoaded', initDayNightVideo);

// ==========================================================================
// 7. DYNAMIC IN-PAGE STAGE DETAIL SECTION (Galleries, Renders & Bocetos)
// ==========================================================================
function initStageDetailSection() {
    const stageSection = document.getElementById('stage-detail-section');
    if (!stageSection) return;

    const params = new URLSearchParams(window.location.search);
    const currentProjectImg = params.get('img') || sessionStorage.getItem('currentProjectImg') || 'assets/PROJECT1.png';
    const currentProjectTitle = params.get('title') || sessionStorage.getItem('currentProjectTitle') || 'CASA VB';
    const altProjectImg = currentProjectImg.includes('PROJECT1') ? 'assets/PROJECT2.png' : 'assets/PROJECT1.png';
    const ambientImg = 'assets/fondo.jpg';

    // Rich Galleries Database for All Stages
    const stageGalleries = {
        'idea-fuerza': {
            name: 'Idea Fuerza',
            badge: 'IDEA FUERZA CONCEPTUAL',
            images: [
                { src: currentProjectImg, label: 'Diagrama Volumétrico Primario' },
                { src: altProjectImg, label: 'Ejes Estructurantes y Orientación' },
                { src: ambientImg, label: 'Integración Morfológica con el Entorno' }
            ]
        },
        'bocetos': {
            name: 'Bocetos',
            badge: 'BOCETOS Y ESQUEMAS',
            images: [
                { src: currentProjectImg, label: 'Boceto Inicial de Masas' },
                { src: altProjectImg, label: 'Esquema de Transición Espacial' },
                { src: ambientImg, label: 'Trazo Morfológico y Sombras' }
            ]
        },
        'planos': {
            name: 'Planos',
            badge: 'PLANOS Y CORTES TÉCNICOS',
            images: [
                { src: altProjectImg, label: 'Planta Arquitectónica General' },
                { src: currentProjectImg, label: 'Corte Transversal Bioclimático' },
                { src: ambientImg, label: 'Elevación y Detalle de Fachada' }
            ]
        },
        'renders': {
            name: 'Renders',
            badge: 'RENDERS FOTORREALISTAS',
            exterior: [
                { src: currentProjectImg, label: 'Fachada Principal - Vista Frontal' },
                { src: altProjectImg, label: 'Perspectiva Volumétrica Sur' },
                { src: ambientImg, label: 'Vista Crepuscular y Paisajismo' }
            ],
            interior: [
                { src: altProjectImg, label: 'Área Social y Doble Altura' },
                { src: currentProjectImg, label: 'Estancia Principal e Iluminación Natural' },
                { src: ambientImg, label: 'Cocina Integrada y Materialidad' }
            ],
            images: [
                { src: currentProjectImg, label: 'Fachada Principal (Exterior)' },
                { src: altProjectImg, label: 'Perspectiva Volumétrica (Exterior)' },
                { src: ambientImg, label: 'Vista Crepuscular (Exterior)' },
                { src: altProjectImg, label: 'Área Social y Doble Altura (Interior)' },
                { src: currentProjectImg, label: 'Estancia Principal (Interior)' },
                { src: ambientImg, label: 'Cocina Integrada y Materialidad (Interior)' }
            ]
        },
        'preparacion-terreno': {
            name: 'Preparación del terreno',
            badge: 'PREPARACIÓN Y MOVIMIENTO DE TIERRAS',
            images: [
                { src: currentProjectImg, label: 'Topografía y Nivelación' },
                { src: altProjectImg, label: 'Replanteo y Excavación de Cimientos' },
                { src: ambientImg, label: 'Consolidación de Subrasante' }
            ]
        },
        'ejecucion': {
            name: 'Ejecución',
            badge: 'EJECUCIÓN DE OBRA IN SITU',
            images: [
                { src: altProjectImg, label: 'Estructura de Hormigón Armado' },
                { src: currentProjectImg, label: 'Vaciado de Losas y Encofrados' },
                { src: ambientImg, label: 'Instalaciones Técnicas y Acabados' }
            ]
        },
        'portafolio': {
            name: 'Portafolio',
            badge: 'PORTAFOLIO ARQUITECTÓNICO',
            images: [
                { src: currentProjectImg, label: 'Vista Emblemática Obra Terminada' },
                { src: altProjectImg, label: 'Perspectiva Arquitectónica Cenital' },
                { src: ambientImg, label: 'Detalles Constructivos y Texturas' }
            ]
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

    let activeStageKey = 'renders';
    let renderSubfilter = 'all'; // 'all', 'exterior', 'interior'
    let currentSlideIdx = 0;

    const galleryImg = document.getElementById('stage-gallery-img');
    const badgeLabel = document.getElementById('stageBadgeLabel');
    const currentIdxEl = document.getElementById('sliderCurrentIdx');
    const totalCountEl = document.getElementById('sliderTotalCount');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const tabBtns = document.querySelectorAll('.stage-tab-btn');
    const deepNavItems = document.querySelectorAll('.deep-nav-item[data-stage]');
    const thumbStrip = document.getElementById('stageThumbStrip');
    const renderSubfilterNav = document.getElementById('renderSubfilterNav');
    const renderSubfilterBtns = document.querySelectorAll('.render-subfilter-btn');
    const bocetosContainer = document.getElementById('bocetosProposalContainer');

    function getCurrentImages() {
        if (activeStageKey === 'renders') {
            if (renderSubfilter === 'exterior') return stageGalleries.renders.exterior;
            if (renderSubfilter === 'interior') return stageGalleries.renders.interior;
            return stageGalleries.renders.images;
        }
        const stageData = stageGalleries[activeStageKey] || stageGalleries['renders'];
        return stageData.images || [];
    }

    function renderThumbnailStrip() {
        if (!thumbStrip) return;
        const images = getCurrentImages();
        thumbStrip.innerHTML = '';
        images.forEach((item, index) => {
            const thumb = document.createElement('img');
            thumb.src = item.src;
            thumb.alt = item.label || `Miniatura ${index + 1}`;
            thumb.className = 'stage-thumb-item' + (index === currentSlideIdx ? ' active' : '');
            thumb.addEventListener('click', (e) => {
                e.preventDefault();
                currentSlideIdx = index;
                updateSliderView(true);
            });
            thumbStrip.appendChild(thumb);
        });
    }

    function updateSliderView(fade = true) {
        const images = getCurrentImages();
        if (images.length === 0) return;

        if (currentSlideIdx >= images.length) currentSlideIdx = 0;
        if (currentSlideIdx < 0) currentSlideIdx = images.length - 1;

        const currentItem = images[currentSlideIdx];
        const stageData = stageGalleries[activeStageKey] || stageGalleries['renders'];

        if (badgeLabel) {
            badgeLabel.textContent = (currentItem && currentItem.label) ? currentItem.label.toUpperCase() : stageData.badge;
        }
        if (currentIdxEl) currentIdxEl.textContent = currentSlideIdx + 1;
        if (totalCountEl) totalCountEl.textContent = images.length;

        // Update active thumbnail in strip
        if (thumbStrip) {
            const thumbs = thumbStrip.querySelectorAll('.stage-thumb-item');
            thumbs.forEach((t, i) => {
                if (i === currentSlideIdx) {
                    t.classList.add('active');
                    t.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                } else {
                    t.classList.remove('active');
                }
            });
        }

        if (galleryImg && currentItem) {
            if (fade) {
                galleryImg.style.opacity = '0';
                setTimeout(() => {
                    galleryImg.src = currentItem.src;
                    galleryImg.style.opacity = '1';
                }, 160);
            } else {
                galleryImg.src = currentItem.src;
                galleryImg.style.opacity = '1';
            }
        }
    }

    function selectStage(stageKey, scrollToSection = false, specificSubfilter = null) {
        if (!stageGalleries[stageKey]) return;
        activeStageKey = stageKey;
        currentSlideIdx = 0;

        if (specificSubfilter) {
            renderSubfilter = specificSubfilter;
            renderSubfilterBtns.forEach(b => {
                if (b.getAttribute('data-sub') === specificSubfilter) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }

        // Toggle Renders Sub-filter (exterior / interior)
        if (renderSubfilterNav) {
            if (stageKey === 'renders') {
                renderSubfilterNav.classList.add('show');
            } else {
                renderSubfilterNav.classList.remove('show');
            }
        }

        // Toggle Bocetos Proposal Presentation Container
        if (bocetosContainer) {
            if (stageKey === 'bocetos') {
                bocetosContainer.classList.add('show');
            } else {
                bocetosContainer.classList.remove('show');
            }
        }

        // Update tabs active state
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-stage') === stageKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        renderThumbnailStrip();
        updateSliderView(true);

        if (scrollToSection) {
            stageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Direct Sub-links from the Segmented Grid Renders Tile (EXTERIOR / INTERIOR)
    document.querySelectorAll('.tile-sublink').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const stage = link.getAttribute('data-stage') || 'renders';
            const sub = link.getAttribute('data-sub') || 'all';
            selectStage(stage, true, sub);
        });
    });

    document.querySelectorAll('.tile-main-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const stage = link.getAttribute('data-stage') || 'renders';
            selectStage(stage, true, 'all');
        });
    });

    // Render subfilter clicks (TODOS, EXTERIOR, INTERIOR)
    renderSubfilterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            renderSubfilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSubfilter = btn.getAttribute('data-sub') || 'all';
            currentSlideIdx = 0;
            renderThumbnailStrip();
            updateSliderView(true);
        });
    });

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
        // If this item contains sublinks, handle click on parent tile
        item.addEventListener('click', (e) => {
            if (e.target.closest('.tile-sublink') || e.target.closest('.tile-main-link')) {
                return; // Handled specifically
            }
            e.preventDefault();
            const stage = item.getAttribute('data-stage');
            selectStage(stage, true);
        });
    });

    // Initialize initial stage
    const initialStage = (window.location.hash && stageGalleries[window.location.hash.replace('#', '').toLowerCase()])
        ? window.location.hash.replace('#', '').toLowerCase()
        : 'renders';

    selectStage(initialStage, !!window.location.hash);
}
document.addEventListener('DOMContentLoaded', initStageDetailSection);
