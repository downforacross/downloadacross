#!/bin/zsh
rm -rf build
mkdir build
cp -r src/* build
cp manifest.json build
cp node_modules/puzjs/puz.js build
version=$(jq .version manifest.json)
version=${version:1:-1}
zip -r extension_${version}.zip build
