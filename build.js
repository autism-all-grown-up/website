const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Global configuration file (build_config.json)
const globalConfig = require('./build_config.json');

// Function to launch Puppeteer and capture the rendered HTML
async function renderStaticPage(directory) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Serve the local index.html file, assuming this path is relative to the project root
  const fileUrl = `file://${path.resolve(directory, 'index.html')}`;
  
  // Navigate to the page and wait for it to fully render
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });  // Wait until no more network requests are made

  // Capture the fully rendered HTML
  const content = await page.content();

  await browser.close();
  return content;
}

// Recursive function to scan directories for config.json files and generate static pages
async function buildStaticPages(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await buildStaticPages(fullPath);
    } else if (entry.name === 'config.json') {
      const configPath = fullPath;
      const relativeDir = path.dirname(configPath);

      const shouldCache = globalConfig.pages_to_cache.includes(relativeDir);

      if (shouldCache) {
        console.log(`Skipping cached page for ${relativeDir}`);
        continue;
      }

      console.log(`Building static page for ${relativeDir}`);

      // Call renderStaticPage to generate static HTML using Puppeteer
      const htmlContent = await renderStaticPage(relativeDir);

      const outputPath = path.join(relativeDir, 'index.html');
      fs.writeFileSync(outputPath, htmlContent, 'utf-8');
      console.log(`Generated ${outputPath}`);
    }
  }
}

// Run the build process from the root directory (or another specified directory)
const rootDir = './';
buildStaticPages(rootDir)
  .then(() => console.log('Static site generation complete!'))
  .catch(err => console.error('Error during static site generation:', err));


