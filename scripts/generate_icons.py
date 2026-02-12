import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # 1. Create Image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 2. Gradient Background (Purple #6c5ce7 to Pink #fd79a8)
    # Linear Gradient from Top-Left to Bottom-Right
    start_color = (108, 92, 231)   # #6c5ce7
    end_color = (253, 121, 168)    # #fd79a8
    
    for y in range(size):
        for x in range(size):
            # Calculate interpolation factor (0 to 1) based on diagonal projection
            p = (x + y) / (2 * size)
            r = int(start_color[0] + (end_color[0] - start_color[0]) * p)
            g = int(start_color[1] + (end_color[1] - start_color[1]) * p)
            b = int(start_color[2] + (end_color[2] - start_color[2]) * p)
            draw.point((x, y), fill=(r, g, b, 255))

    # 3. Draw Symbol (Stylized Wheel)
    center = size // 2
    radius = int(size * 0.45)
    
    # Outer Circle (White, Thick)
    draw.ellipse((center - radius, center - radius, center + radius, center + radius), outline=(255, 255, 255, 255), width=int(size * 0.05))
    
    # Inner Dots / Spokes
    # Draw a 4-leaf clover / Star shape
    inner_radius = int(size * 0.25)
    draw.ellipse((center - inner_radius, center - inner_radius, center + inner_radius, center + inner_radius), fill=(255, 255, 255, 255))
    
    # Save
    output_path = os.path.join('public', filename)
    img.save(output_path, 'PNG')
    print(f"Generated {output_path}")

def main():
    if not os.path.exists('public'):
        os.makedirs('public')
        
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    create_icon(180, 'apple-touch-icon.png')

if __name__ == "__main__":
    main()
