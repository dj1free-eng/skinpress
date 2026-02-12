#!/bin/bash
# Script para generar iconos PNG desde SVG
# Requiere ImageMagick instalado: brew install imagemagick (macOS) o apt-get install imagemagick (Linux)

echo "Generando iconos PNG desde SVG..."

if command -v convert &> /dev/null; then
    convert public/icon-192.svg public/icon-192.png
    convert public/icon-512.svg public/icon-512.png
    echo "✓ Iconos PNG generados exitosamente"
    echo "  - public/icon-192.png"
    echo "  - public/icon-512.png"
else
    echo "⚠ ImageMagick no está instalado"
    echo ""
    echo "Opciones para generar los iconos:"
    echo "1. Instalar ImageMagick:"
    echo "   macOS: brew install imagemagick"
    echo "   Linux: sudo apt-get install imagemagick"
    echo "   Windows: https://imagemagick.org/script/download.php"
    echo ""
    echo "2. Usar un convertidor online:"
    echo "   - https://cloudconvert.com/svg-to-png"
    echo "   - Sube icon-192.svg y icon-512.svg"
    echo "   - Descarga los PNG generados"
    echo "   - Guárdalos en public/"
    echo ""
    echo "3. Usar Figma/Photoshop/Illustrator:"
    echo "   - Abre los SVG"
    echo "   - Exporta como PNG a 192x192 y 512x512"
fi
