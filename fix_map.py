import re
import os

svg_path = r'c:\Users\Gabo\Desktop\arqui\world.svg'
with open(svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Strip out sodipodi namedview and metadata
svg_content = re.sub(r'<metadata.*?</metadata>', '', svg_content, flags=re.DOTALL)
svg_content = re.sub(r'<sodipodi:namedview.*?</sodipodi:namedview>', '', svg_content, flags=re.DOTALL)
# Strip <?xml ...?>
svg_content = re.sub(r'<\?xml[^>]+\?>', '', svg_content)
# Strip <!-- ... -->
svg_content = re.sub(r'<!--.*?-->', '', svg_content)

# Add circles before </svg>
markers = """
    <!-- Markers -->
    <circle id="marker-usa" class="map-marker" cx="200" cy="200" r="10" />
    <circle id="marker-bolivia" class="map-marker" cx="280" cy="380" r="10" />
    <circle id="marker-india" class="map-marker" cx="680" cy="280" r="10" />
"""
svg_content = svg_content.replace('</svg>', markers + '</svg>')

html_path = r'c:\Users\Gabo\Desktop\arqui\trayectoria.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

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

# Replace the old map-container entirely
# The old container is:
# <div class="map-container">
#     <img src="assets/mapa.png" ...>
#     <div class="map-locations">...</div>
# </div>
html = re.sub(r'<div class="map-container">.*?</div>\s*</div>', map_module_html, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML modified successfully.")
