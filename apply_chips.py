import re

# 1. Update HTML
html_path = r'c:\Users\Gabo\Desktop\arqui\proyectos.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_filters = """<nav class="scrollable-filters">
                      <button class="filter-chip active" data-filter="all">Todos</button>
                      <button class="filter-chip" data-filter="casas">Casas</button>
                      <button class="filter-chip" data-filter="edificios">Edificios</button>
                      <button class="filter-chip" data-filter="corporativos">Corporativos</button>
                      <button class="filter-chip" data-filter="culturales">Culturales</button>
                      <button class="filter-chip" data-filter="concursos">Concursos</button>
                  </nav>"""

html = re.sub(r'<div class="filters-horizontal".*?</div>', new_filters, html, flags=re.DOTALL)
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update CSS
css_path = r'c:\Users\Gabo\Desktop\arqui\styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
/* Scrollable Chips Mobile Filter */
.scrollable-filters {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    gap: 12px;
    padding: 0 15px;
    margin-bottom: 2rem;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}
.scrollable-filters::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}
.filter-chip {
    background: transparent;
    border: 1px solid #CCCCCC;
    border-radius: 50px;
    font-family: var(--font-body, 'Montserrat', sans-serif);
    font-size: 14px;
    color: #333333;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
}
.filter-chip.active {
    background: #222222;
    color: #FFFFFF;
    border-color: #222222;
}
"""
css += new_css
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# 3. Update JS
js_path = r'c:\Users\Gabo\Desktop\arqui\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# The JS already has something for filter-btn, let's just append logic for filter-chip
new_js = """
// Scrollable Chips Logic
document.addEventListener('DOMContentLoaded', () => {
    const filterChips = document.querySelectorAll('.filter-chip');
    const galleryItems = document.querySelectorAll('.main-projects-grid .gallery-item');
    
    if (filterChips.length > 0) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active from all
                filterChips.forEach(c => c.classList.remove('active'));
                // Add active to clicked
                chip.classList.add('active');
                
                // Filter logic
                const filter = chip.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else {
                        if (item.classList.contains(filter)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
});
"""

js += new_js
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Implemented mobile scrollable chips.")
