rm -rf build
mkdir build
cp -r src/* build
cp manifest.json build
cp node_modules/puzjs/puz.js build
zip -r extension.zip build
