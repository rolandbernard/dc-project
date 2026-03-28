#!/usr/bin/env bash
# This is a small script that generates all smaller icons from the main favicon.

DIR=app/public
SIZES=(16 32 48 64 128 180 256 1024)

for size in "${SIZES[@]}"; do
    magick -background none $DIR/favicon.svg -resize "${size}x${size}" "$DIR/appicon-${size}x${size}.png"
done

magick -background none $DIR/favicon.svg -resize 32x32 $DIR/favicon.png
magick -background none $DIR/favicon.svg -define icon:auto-resize=16,32,48 $DIR/favicon.ico

