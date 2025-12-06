#!/bin/bash

# Create the Minecraft grass block icon using ImageMagick
# This creates a simple grass block icon suitable for Eaglercraft

# Create a temporary PNG if needed, then convert to ICO
convert -size 256x256 xc:white \
  -fill '#90EE90' -draw "rectangle 64,64 192,192" \
  -fill '#8B7355' -draw "rectangle 64,128 192,192" \
  /tmp/minecraft_icon.png

# Convert to ICO format with multiple sizes
convert /tmp/minecraft_icon.png \
  -define icon:auto-resize=256,128,96,64,48,32,16 \
  /workspaces/farmsium/build/icon.ico

echo "Icon created successfully at /workspaces/farmsium/build/icon.ico"
