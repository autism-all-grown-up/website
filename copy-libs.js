const fs = require('fs');
const path = require('path');

// Path to the assets folder where files will be copied
const assetsFolder = path.resolve(__dirname, 'assets', 'js');

// Ensure assets/js directory exists
if (!fs.existsSync(assetsFolder)) {
    fs.mkdirSync(assetsFolder, { recursive: true });
}

// Library paths
const libraries = {
    mustache: 'node_modules/mustache/mustache.mjs',
    marked: 'node_modules/marked/lib/marked.esm.js',
    'marked-gfm-heading-id': 'node_modules/marked-gfm-heading-id/lib/index.umd.js',
    'marked-custom-heading-id': 'node_modules/marked-custom-heading-id/lib/index.umd.js'
};

// Copy libraries to assets/js if they exist
Object.entries(libraries).forEach(([lib, src]) => {
    const dest = path.join(assetsFolder, path.basename(src));
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${path.basename(src)} to ${dest}`);
    } else {
        console.warn(`Could not locate ESM file for ${lib}. Please check if it provides an ESM version.`);
    }
});

