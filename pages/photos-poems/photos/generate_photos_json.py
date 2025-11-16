#!/usr/bin/env python3

"""
generate_photos_json.py
-----------------------
Scans ../../../assets/img/photos-poems/photos/ for image files
and writes photos.json here (pages/photos-poems/photos/photos.json).

Run from this directory:
    python3 generate_photos_json.py
"""

import json
import pathlib

# --- Paths ---
# Current script directory
script_dir = pathlib.Path(__file__).resolve().parent

# Folder containing the images
image_dir = (script_dir / "../../../assets/img/photos-poems/photos").resolve()

# Output file (JSON) in the same folder as this script
output_path = script_dir / "photos.json"

# File extensions to include
extensions = {".jpg", ".jpeg", ".png", ".webp"}

# --- Collect image filenames ---
files = sorted([
    p.name for p in image_dir.iterdir()
    if p.suffix.lower() in extensions and p.is_file()
])

# --- Ensure consistent case & human-friendly order ---
files.sort(key=lambda n: n.lower())


# --- Write JSON ---
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(files, f, indent=2)

print(f"Found {len(files)} image(s)")
print(f"JSON written to {output_path}")
