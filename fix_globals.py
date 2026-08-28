import os
import glob
import re

css_path = r'c:\Users\Gabo\Desktop\arqui\styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Fix navbar hover color
css_content = css_content.replace('background-color: rgba(18, 18, 18, 0.95);', 'background-color: rgba(0, 0, 0, 0.6);')

# Fix video hidden behind background
# We will make .hero-section have a z-index of 0 to create a stacking context
if '{ background-color: #000; }' in css_content:
    css_content = css_content.replace('{ background-color: #000; }', '{ background-color: #000; z-index: 0; position: relative; }')

# Fix audio button CSS so it fits in the navbar
# We will just style .nav-audio-btn
css_content += """
/* Navbar Audio Button */
.nav-audio-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 20px;
    outline: none;
    transition: color 0.3s;
}
.navbar.navbar-dark .nav-audio-btn {
    color: #333;
}
.navbar:hover .nav-audio-btn {
    color: #fff !important;
}
.navbar.navbar-dark:hover .nav-audio-btn {
    color: #fff !important;
}
@media (max-width: 768px) {
    .nav-audio-btn {
        margin-left: 10px;
        margin-right: 15px;
    }
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)


js_path = r'c:\Users\Gabo\Desktop\arqui\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Update script.js for the new nav audio button and localStorage
audio_js = """
// GLOBAL AUDIO LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('nav-audio-toggle');
    
    if(audio && audioBtn) {
        const icon = audioBtn.querySelector('i');
        
        // Check local storage for playing state
        const isPlaying = localStorage.getItem('siteAudioPlaying') === 'true';
        
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
"""

# Append if not there
if 'GLOBAL AUDIO LOGIC' not in js_content:
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write("\n" + audio_js)


# Update all HTML files
html_files = glob.glob(r'c:\Users\Gabo\Desktop\arqui\*.html')

nav_audio_btn = '<button id="nav-audio-toggle" class="nav-audio-btn" title="Toggle Audio"><i class="fas fa-volume-mute"></i></button>'
audio_tag = '<audio id="bg-audio" loop><source src="assets/musica.mp3" type="audio/mpeg"></audio>'

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove old audio/button from bottom if present
    content = re.sub(r'<audio[^>]*id="bg-audio"[^>]*>.*?</audio>', '', content, flags=re.DOTALL)
    content = re.sub(r'<button[^>]*id="audio-toggle"[^>]*>.*?</button>', '', content, flags=re.DOTALL)
    
    # 2. Add audio tag to body
    if '<audio id="bg-audio"' not in content:
        content = content.replace('</body>', f'    {audio_tag}\n</body>')
    
    # 3. Add button to navbar. We'll put it right before the hamburger
    if 'id="nav-audio-toggle"' not in content:
        content = content.replace('<div class="hamburger">', f'{nav_audio_btn}\n            <div class="hamburger">')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Audio, Navbar Hover, and Video Fixes applied.")
