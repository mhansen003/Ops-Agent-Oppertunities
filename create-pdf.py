from PIL import Image
import os

# Directory containing slide images
slides_dir = r"C:\GitHub\Ops-Agent-Oppertunities\slides"
output_path = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop', 'CMG-AI-Agent-Opportunities-2026.pdf')

# Get all slide images in order
slide_files = sorted([f for f in os.listdir(slides_dir) if f.startswith('slide-') and f.endswith('.png')])

print(f"Found {len(slide_files)} slides")

# Open all images
images = []
for slide_file in slide_files:
    img_path = os.path.join(slides_dir, slide_file)
    img = Image.open(img_path)
    # Convert to RGB (required for PDF)
    if img.mode == 'RGBA':
        # Create white background for transparency
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    images.append(img)
    print(f"  Loaded: {slide_file}")

if images:
    # Save as PDF
    first_image = images[0]
    remaining_images = images[1:] if len(images) > 1 else []

    first_image.save(
        output_path,
        'PDF',
        save_all=True,
        append_images=remaining_images,
        resolution=150.0
    )
    print(f"\nPDF created successfully!")
    print(f"Output: {output_path}")
else:
    print("No images found!")
