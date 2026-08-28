import os

base_path = r'c:\Users\Gabo\Desktop\arqui'
renders_path = os.path.join(base_path, 'renders.html')

with open(renders_path, 'r', encoding='utf-8') as f:
    template = f.read()

pages_to_create = {
    'planos.html': ('Proyecto 1 - Planos', 'PLANOS'),
    'area.html': ('Proyecto 1 - Área', 'ÁREA DEL PROYECTO'),
    'obra.html': ('Proyecto 1 - Obra', 'OBRA EN CONSTRUCCIÓN'),
    'final.html': ('Proyecto 1 - Resultado', 'RESULTADO FINAL')
}

for filename, (title, heading) in pages_to_create.items():
    new_content = template.replace('Proyecto 1 - Renders', title)
    new_content = new_content.replace('RENDERS', heading)
    
    out_path = os.path.join(base_path, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Sub-pages created successfully.")
