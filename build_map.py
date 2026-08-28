import re
import os

# 1. Read SVG
with open(r'c:\Users\Gabo\Desktop\arqui\world.svg', 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Strip out sodipodi namedview and metadata to shrink size a bit (optional)
svg_content = re.sub(r'<metadata.*?</metadata>', '', svg_content, flags=re.DOTALL)
svg_content = re.sub(r'<sodipodi:namedview.*?</sodipodi:namedview>', '', svg_content, flags=re.DOTALL)

# Add circles before </svg>
markers = """
    <!-- Markers -->
    <circle id="marker-usa" class="map-marker" cx="200" cy="200" r="10" />
    <circle id="marker-bolivia" class="map-marker" cx="280" cy="380" r="10" />
    <circle id="marker-india" class="map-marker" cx="680" cy="280" r="10" />
"""
svg_content = svg_content.replace('</svg>', markers + '</svg>')

# 2. Modify trayectoria.html
html_path = r'c:\Users\Gabo\Desktop\arqui\trayectoria.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the img tag with the module
map_module_html = f"""
        <div class="map-module">
            <div class="map-container">
                {svg_content}
            </div>
            <div class="map-controls">
                <span class="country-btn" data-country="bolivia">BOLIVIA</span>
                <span class="country-btn" data-country="usa">USA</span>
                <span class="country-btn" data-country="india">INDIA</span>
            </div>
            <div id="map-results" class="map-results">
                <p style="text-align:center; color:#666;">Selecciona un país para ver los proyectos.</p>
            </div>
        </div>
"""

# We look for where to inject. The user likely has an img for the map. Let's find it.
# If no img, let's just put it after the title.
if '<img src="assets/trayectoria' in html or '<img' in html:
    html = re.sub(r'<img[^>]+alt="Mapa"[^>]*>', map_module_html, html)
else:
    # Just put after title
    html = re.sub(r'(<h1[^>]*>.*?</h1>)', r'\1' + map_module_html, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Append CSS
css = """
/* MAP MODULE */
.map-module { max-width: 950px; margin: 40px auto; text-align: center; }
.map-container { position: relative; width: 100%; height: auto; }
.map-container svg { width: 100%; height: auto; fill: #E0E0E0; stroke: #FFFFFF; stroke-width: 0.5; }
.map-marker { fill: #222222; cursor: pointer; transition: opacity 0.3s, transform 0.3s, fill 0.3s; transform-origin: center; }
.map-marker:hover { opacity: 0.8; }
.map-marker.active { animation: pulseMarker 1.5s infinite; fill: #000; }
.map-marker.dimmed { opacity: 0.3; }

/* Ensure transform origin is applied correctly for SVG circles by using explicit pixel coordinates or css variables, but simple scale might jitter if transform-origin is not absolute. We will use absolute center of the SVG if needed, or better, we can use CSS box-sizing. Wait, transform-origin: center on SVG elements works in modern browsers. */

@keyframes pulseMarker {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
}

.map-controls { display: flex; justify-content: center; gap: 30px; margin-top: 30px; border-bottom: 1px solid #E0E0E0; padding-bottom: 15px; }
.country-btn { cursor: pointer; font-family: var(--font-heading); color: #666; transition: color 0.3s, font-weight 0.3s; font-size: 1.1em; letter-spacing: 1px; }
.country-btn:hover { color: #222; }
.country-btn.active { color: #222; font-weight: 700; }

.map-results { margin-top: 30px; text-align: left; opacity: 0; transition: opacity 0.5s ease-in-out; min-height: 150px; }
.map-results.show { opacity: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.project-card { border: 1px solid #eee; padding: 20px; background: #fafafa; border-left: 4px solid #222; }
.project-card h4 { margin-bottom: 5px; font-family: var(--font-heading); color: #222; }
.project-card p { font-size: 0.9em; color: #666; margin: 0; }

@media (max-width: 768px) {
    .map-results.show { grid-template-columns: 1fr; }
}
"""

with open(r'c:\Users\Gabo\Desktop\arqui\styles.css', 'a', encoding='utf-8') as f:
    f.write(css)

# 4. Append JS
js = """
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
"""

with open(r'c:\Users\Gabo\Desktop\arqui\script.js', 'a', encoding='utf-8') as f:
    f.write(js)

print("Map module built successfully.")
