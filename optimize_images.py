#!/usr/bin/env python3
"""
Image optimization script for Diet Swad landing page
Compresses images while maintaining quality
"""

from PIL import Image
import os
import sys

def optimize_image(input_path, output_path=None, max_size=None, quality=85):
    """
    Optimize an image by reducing file size while maintaining quality

    Args:
        input_path: Path to input image
        output_path: Path to save optimized image (defaults to input_path)
        max_size: Tuple of (width, height) to resize to (maintains aspect ratio)
        quality: JPEG quality (1-100, default 85)
    """
    if output_path is None:
        output_path = input_path

    try:
        img = Image.open(input_path)

        # Convert RGBA to RGB if saving as JPEG
        if img.mode == 'RGBA' and output_path.lower().endswith(('.jpg', '.jpeg')):
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background

        # Resize if max_size is specified
        if max_size:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Get original file size
        original_size = os.path.getsize(input_path)

        # Save optimized image
        if output_path.lower().endswith('.png'):
            # Optimize PNG
            img.save(output_path, 'PNG', optimize=True)
        elif output_path.lower().endswith(('.jpg', '.jpeg')):
            # Optimize JPEG
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
        else:
            img.save(output_path, optimize=True)

        # Get new file size
        new_size = os.path.getsize(output_path)
        reduction = ((original_size - new_size) / original_size) * 100

        print(f"✓ {os.path.basename(input_path)}")
        print(f"  {original_size/1024:.1f}KB → {new_size/1024:.1f}KB ({reduction:.1f}% reduction)")

    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}", file=sys.stderr)

def main():
    ref_pics_dir = "/home/user/DietSwad/refference_pics"

    print("🖼️  Optimizing landing page images...\n")

    # Optimize hero image (resize to reasonable dimensions)
    print("Hero Image:")
    optimize_image(
        f"{ref_pics_dir}/Hero image.png",
        max_size=(1200, 1200),
        quality=85
    )
    print()

    # Optimize product images (resize to reasonable dimensions)
    print("Product Images:")
    product_images = [
        "Power bites.png",
        "Royal bites.png",
        "butter cookies.png",
        "Casew.png",
        "peri peri.png",
        "Peanut Sesame Delights.jpeg"
    ]

    for img in product_images:
        img_path = f"{ref_pics_dir}/{img}"
        if os.path.exists(img_path):
            optimize_image(img_path, max_size=(800, 800), quality=85)
    print()

    # Optimize social media icons (should be small!)
    print("Social Media Icons:")
    social_icons = {
        "insta.png": (64, 64),
        "fb.png": (64, 64),
        "wp.png": (64, 64),
        "mail.png": (64, 64)
    }

    for icon, size in social_icons.items():
        icon_path = f"{ref_pics_dir}/{icon}"
        if os.path.exists(icon_path):
            optimize_image(icon_path, max_size=size, quality=90)
    print()

    # Optimize other images
    print("Other Images:")
    other_images = [
        ("veg logo.png", (100, 100)),
        ("flat logo.jpg", (300, 300)),
        ("logo.jpg", (300, 300))
    ]

    for img, size in other_images:
        img_path = f"{ref_pics_dir}/{img}"
        if os.path.exists(img_path):
            optimize_image(img_path, max_size=size, quality=90)

    print("\n✅ Image optimization complete!")

if __name__ == "__main__":
    main()
