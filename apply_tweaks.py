import re

# 1. Update index.html audio src
idx_path = r'c:\Users\Gabo\Desktop\arqui\index.html'
with open(idx_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()
idx_content = idx_content.replace('assets/music.mp3', 'assets/musica.mp3')
with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx_content)

# 2. Update equipo.html images
eq_path = r'c:\Users\Gabo\Desktop\arqui\equipo.html'
with open(eq_path, 'r', encoding='utf-8') as f:
    eq_content = f.read()
# Replace first two placeholder images with equipo1 and equipo2
# We can just replace the first instance of assets/fondo.jpg with assets/equipo1.jpg, etc.
eq_content = eq_content.replace('assets/fondo.jpg', 'assets/equipo1.jpg', 1)
eq_content = eq_content.replace('assets/fondo.jpg', 'assets/equipo2.jpg', 1)
# Just in case there's another image reference
eq_content = eq_content.replace('unsplash.com', 'unsplash.com') # dummy
with open(eq_path, 'w', encoding='utf-8') as f:
    f.write(eq_content)

# 3. Update styles.css (Navbar hover & video zoom out)
css_path = r'c:\Users\Gabo\Desktop\arqui\styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Update Navbar hover to dark
css_content = css_content.replace('background-color: rgba(255, 255, 255, 0.95);', 'background-color: rgba(18, 18, 18, 0.95);')
css_content = css_content.replace('color: #333 !important;', 'color: #FFF !important;')
css_content = css_content.replace('background-color: #333 !important;', 'background-color: #FFF !important;')

# Update video to zoom out
# Append a specific rule for hero-video to zoom out
css_content += "\n/* User Request: Zoom out video */\n.hero-section { background-color: #000; }\n.hero-video { transform: scale(0.85); object-fit: contain; }\n"

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updates applied.")
