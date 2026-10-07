import sys
import os
import shutil
import struct
from PyQt5 import QtCore, QtGui, QtSvg

def generate_svg(stroke_color="#0A2540", bg_color="#FFFFFF", is_transparent=False):
    # Canvas 512x512
    # Center X = 256, Center Y = 250
    cx = 256.0
    cy_mid = 248.0
    
    # Scale factor S ≈ 2.75 to center within 512x512 with safe ~13% padding for circular cropping
    S = 2.75
    orig_cy = 61.5
    
    def transform(ox, oy):
        x = cx + (ox - 75.5) * S
        y = cy_mid + (oy - orig_cy) * S
        return round(x, 2), round(y, 2)
    
    nodes_orig = {
        'TL_out': (6.0, 6.0),
        'TR_out': (145.0, 6.0),
        'TL_in':  (44.0, 6.0),
        'TR_in':  (107.0, 6.0),
        'L_mid_out': (22.0, 40.0),
        'R_mid_out': (129.0, 40.0),
        'L_mid_in':  (41.5, 34.0),
        'R_mid_in':  (109.5, 34.0),
        'Center_dip': (75.5, 71.0),
        'Bot_L': (60.0, 117.0),
        'Bot_R': (91.0, 117.0),
    }
    
    nodes = {k: transform(v[0], v[1]) for k, v in nodes_orig.items()}
    
    # Line intersection junction points
    def line_intersection(p1, p2, p3, p4):
        x1, y1 = p1
        x2, y2 = p2
        x3, y3 = p3
        x4, y4 = p4
        denom = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
        if abs(denom) < 1e-9:
            return None
        t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denom
        return round(x1 + t*(x2-x1), 2), round(y1 + t*(y2-y1), 2)
        
    L_junc = line_intersection(nodes['L_mid_out'], nodes['Center_dip'], nodes['L_mid_in'], nodes['Bot_L'])
    R_junc = line_intersection(nodes['R_mid_out'], nodes['Center_dip'], nodes['R_mid_in'], nodes['Bot_R'])
    
    all_pts = {**nodes, 'L_junc': L_junc, 'R_junc': R_junc}
    
    lines = [
        # 1. Top caps
        ('TL_out', 'TL_in'),
        ('TR_in', 'TR_out'),
        
        # 2. Outer contour
        ('TL_out', 'L_mid_out'),
        ('L_mid_out', 'Bot_L'),
        ('TR_out', 'R_mid_out'),
        ('R_mid_out', 'Bot_R'),
        
        # 3. Base horizontal bar
        ('Bot_L', 'Bot_R'),
        
        # 4. Inner V notch
        ('TL_in', 'Center_dip'),
        ('TR_in', 'Center_dip'),
        
        # 5. Upper truss struts
        ('TL_in', 'L_mid_in'),
        ('TR_in', 'R_mid_in'),
        ('TL_out', 'L_mid_in'),
        ('TR_out', 'R_mid_in'),
        ('L_mid_out', 'TL_in'),
        ('R_mid_out', 'TR_in'),
        
        # 6. Diagonal passing through junctions to Center_dip
        ('L_mid_out', 'Center_dip'),
        ('R_mid_out', 'Center_dip'),
        
        # 7. Struts passing through junctions to bottom
        ('L_mid_in', 'Bot_L'),
        ('R_mid_in', 'Bot_R'),
        
        # 8. Cross struts in lower section
        ('L_junc', 'Bot_R'),
        ('R_junc', 'Bot_L'),
    ]
    
    stroke_w = 12.0
    node_outer_r = 18.0
    node_inner_r = 8.5
    
    bg_rect = "" if is_transparent else f'<rect width="512" height="512" fill="{bg_color}"/>'
    
    lines_svg = []
    for n1, n2 in lines:
        p1 = all_pts[n1]
        p2 = all_pts[n2]
        lines_svg.append(f'  <line x1="{p1[0]}" y1="{p1[1]}" x2="{p2[0]}" y2="{p2[1]}" stroke="{stroke_color}" stroke-width="{stroke_w}" stroke-linecap="round" stroke-linejoin="round"/>')
    
    nodes_svg = []
    for name, (x, y) in nodes.items():
        nodes_svg.append(f'  <circle cx="{x}" cy="{y}" r="{node_outer_r}" fill="{stroke_color}"/>')
        nodes_svg.append(f'  <circle cx="{x}" cy="{y}" r="{node_inner_r}" fill="{bg_color if not is_transparent else "#FFFFFF"}"/>')
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
{bg_rect}
<g id="verisett-constellation-v">
{'\\n'.join(lines_svg)}
{'\\n'.join(nodes_svg)}
</g>
</svg>'''
    return svg

def render_svg_to_png(svg_string, out_path, size):
    app = QtGui.QGuiApplication.instance()
    if app is None:
        app = QtGui.QGuiApplication(sys.argv)
    
    image = QtGui.QImage(size, size, QtGui.QImage.Format_ARGB32_Premultiplied)
    image.fill(QtCore.Qt.transparent)
    
    painter = QtGui.QPainter(image)
    painter.setRenderHint(QtGui.QPainter.Antialiasing, True)
    painter.setRenderHint(QtGui.QPainter.SmoothPixmapTransform, True)
    
    renderer = QtSvg.QSvgRenderer(QtCore.QByteArray(svg_string.encode('utf-8')))
    renderer.render(painter)
    painter.end()
    
    image.save(out_path, "PNG")

def create_ico(png_files_with_sizes, ico_path):
    num_images = len(png_files_with_sizes)
    header = struct.pack('<HHH', 0, 1, num_images)
    
    entries = []
    image_datas = []
    current_offset = 6 + num_images * 16
    
    for png_path, sz in png_files_with_sizes:
        with open(png_path, 'rb') as f:
            data = f.read()
        image_datas.append(data)
        w = sz if sz < 256 else 0
        h = sz if sz < 256 else 0
        size_bytes = len(data)
        entry = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, size_bytes, current_offset)
        entries.append(entry)
        current_offset += size_bytes
        
    with open(ico_path, 'wb') as f:
        f.write(header)
        for e in entries:
            f.write(e)
        for d in image_datas:
            f.write(d)
    print(f'Wrote {ico_path} ({num_images} sizes)')

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(base_dir, 'public')
    app_dir = os.path.join(base_dir, 'app')
    temp_dir = os.path.join(base_dir, '.temp_icons')
    os.makedirs(temp_dir, exist_ok=True)
    
    svg = generate_svg(stroke_color="#0A2540", bg_color="#FFFFFF")
    
    # Save SVG versions
    with open(os.path.join(public_dir, 'icon.svg'), 'w') as f:
        f.write(svg)
    with open(os.path.join(public_dir, 'favicon.svg'), 'w') as f:
        f.write(svg)
        
    # Render PNG sizes
    sizes = [16, 32, 48, 96, 180, 192, 512]
    rendered_pngs = {}
    for s in sizes:
        p = os.path.join(temp_dir, f'icon_{s}.png')
        render_svg_to_png(svg, p, s)
        rendered_pngs[s] = p
        print(f'Rendered {s}x{s} PNG')
        
    # Build ICO with standard favicon sizes: 16, 32, 48, 96, 192
    ico_temp = os.path.join(temp_dir, 'favicon.ico')
    create_ico([
        (rendered_pngs[16], 16),
        (rendered_pngs[32], 32),
        (rendered_pngs[48], 48),
        (rendered_pngs[96], 96),
        (rendered_pngs[192], 192),
    ], ico_temp)
    
    # Copy to public/
    shutil.copy2(ico_temp, os.path.join(public_dir, 'favicon.ico'))
    shutil.copy2(rendered_pngs[192], os.path.join(public_dir, 'icon.png'))
    shutil.copy2(rendered_pngs[180], os.path.join(public_dir, 'apple-icon.png'))
    shutil.copy2(rendered_pngs[48], os.path.join(public_dir, 'icon-48x48.png'))
    shutil.copy2(rendered_pngs[96], os.path.join(public_dir, 'icon-96x96.png'))
    shutil.copy2(rendered_pngs[192], os.path.join(public_dir, 'icon-192x192.png'))
    shutil.copy2(rendered_pngs[512], os.path.join(public_dir, 'icon-512x512.png'))
    
    # Copy to app/
    shutil.copy2(ico_temp, os.path.join(app_dir, 'favicon.ico'))
    shutil.copy2(rendered_pngs[192], os.path.join(app_dir, 'icon.png'))
    shutil.copy2(rendered_pngs[180], os.path.join(app_dir, 'apple-icon.png'))
    
    print('All favicon and icon assets successfully created and placed in public/ and app/')

if __name__ == '__main__':
    main()
