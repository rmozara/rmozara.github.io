#!/bin/bash

INPUT_DIR="."
OUTPUT_DIR="."

mkdir -p "$OUTPUT_DIR"

for img in *.jpg *.JPG *.jpeg *.png; do
    if [ -f "$img" ]; then
        base=$(basename "$img")
        out="$OUTPUT_DIR/${base%.*}.webp"
        echo "Compressing $img → $out..."
        convert "$img" -resize 2500x2500\> -quality 82 "$out"
    fi
done

echo "Done! All images saved in $OUTPUT_DIR"
