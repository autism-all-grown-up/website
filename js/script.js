/*
//  Import libraries from CDN in ESM mode
import Mustache from '../assets/mustache/mustache.js';
import { marked } from '../assets/marked/marked.js';
import { gfmHeadingId } from '../assets/marked-gfm-heading-id/marked-gfm-heading-id.js';
// Import marked-custom-heading-id as the default export
import customHeadingId from '../assets/marked-custom-heading-id/marked-custom-heading-id.js';
import YAML from '../assets/js-yaml/js-yaml.js';
*/

// Import libraries from CDN
// Some are the default export. Other's aren't.
import Mustache from 'https://esm.run/mustache';
import { marked } from 'https://esm.run/marked';
import { gfmHeadingId } from 'https://esm.run/marked-gfm-heading-id';
import customHeadingId from 'https://esm.run/marked-custom-heading-id';
import YAML from 'https://esm.run/js-yaml';

// Configure Marked with plugins
const options = { /* custom options */ };
marked.use(gfmHeadingId(options));
marked.use(customHeadingId());
marked.use({
  breaks: true,
  gfm: true,
});


class ClientSideRouter {
  constructor() {
    this.currentUrl = window.location.pathname;
    this.init();
  }

  init() {
    window.addEventListener('load', this.onLoad.bind(this));
    window.addEventListener('popstate', this.onPopState.bind(this));
    document.addEventListener('click', this.handleLinks.bind(this));
  }

  parseFrontmatter(markdown) {
    // console.log(`parseFrontmatter: \n${markdown}`);
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(markdown);
    if (match) {
      const frontmatter = YAML.load(match[1]);
      const content = match[2];
      return { frontmatter, content };
    }
    return { frontmatter: {}, content: markdown };
  }

  async fetchMarkdownWithFrontmatter(sourceUrl, contentName) {
    // console.log(`fetchMarkdownWithFrontmatter: ${sourceUrl}, ${contentName}`);

    const response = await fetch(sourceUrl);
    const markdown = await response.text();
    const { frontmatter, content } = this.parseFrontmatter(markdown);
    // console.log({frontmatter, content});

    return { ...frontmatter, [contentName]: marked.parse(content) };
  }

  async onLoad() {
    this.globalConfig = await this.fetchFile("config.json", "json");

    // Load default content
    await this.renderQuery('default');

    const currentPage = this.getQueryParam('page') || 'home';
    await this.renderQuery(currentPage);
    this.setActiveLink(currentPage);
    this.scrollToLocation();
  }

  scrollToLocation() {
    const { hash } = window.location;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        const topPosition = document.querySelector('nav').offsetHeight;
        const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - topPosition;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async onPopState() {
    const pathQuery = this.getQueryParam('page') || 'home';
    await this.renderQuery(pathQuery);
    this.setActiveLink(pathQuery);
    this.scrollToLocation();
  }

  async handleLinks(event) {
    const targetElement = event.target;
    if (targetElement.nodeName === 'A' && !this.isExternalLink(targetElement)) {
      event.preventDefault();
      const targetPage = new URL(targetElement.href).searchParams.get('page') || 'home';
      if (window.location.search !== `?page=${targetPage}`) {
        await this.renderQuery(targetPage);
        this.setActiveLink(targetPage);
        window.history.pushState(null, '', `?page=${targetPage}`);
        this.scrollToLocation();
        this.collapseMenu();
      }
    }
  }

  collapseMenu() {
    const dropCheckbox = document.getElementById('drop');
    if (dropCheckbox && dropCheckbox.checked) {
      dropCheckbox.checked = false;
    }
  }

  isExternalLink(link) {
    return new URL(link.href).host !== window.location.host;
  }

  getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  setActiveLink(targetPage) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      const hrefQuery = new URLSearchParams(link.getAttribute('href')).get('page');
      link.classList.toggle('active', hrefQuery === targetPage);
    });
  }

  async fetchFile(filePath, dataType = 'text') {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      return dataType === 'json' ? await response.json() : await response.text();
    } catch (error) {
      console.error(`Error fetching file: ${filePath}`, error);
      return null;
    }
  }


  async renderQuery(path) {
    // console.log(`renderQuery: ${path}`);

    const contentDir = `content/${path}`;
    const config = await this.fetchFile(`${contentDir}/config.json`, 'json');

    // Check if the config is a single object and wrap it in an array if needed
    const configArray = Array.isArray(config) ? config : [config];

    // Process each configuration entry in the array
    for (const slotConfig of configArray) {
      // console.log({ slotConfig });

      await this.renderSlot(slotConfig, contentDir);
      if (slotConfig.plugins) {
        await this.loadPlugins(slotConfig.plugins);  // Load page-specific plugins
      }
    }

    // Ensure all default plugins are loaded after page-specific plugins
    if (this.globalConfig && this.globalConfig.default_plugins) {
      await this.loadPlugins(this.globalConfig.default_plugins);  // Load default plugins
    }
  }


  async renderSlot({ slot, template, data }, dir) {
    console.log("renderSlot");
    console.log({slot, template, data, dir});

    const slotElement = document.getElementById(slot);
    if (!slotElement) {
      console.error('Slot element missing:', slot);
      return;
    }

    // Ensure sources is a valid array
    const sources = Array.isArray(data.sources) ? data.sources : [data.sources].filter(Boolean);

    console.log("Processing sources:", sources);

    // Process each source asynchronously inside map
    const sourcesPromises = sources.map(async (source) => {
      if (!source || !source.source) {
        console.warn("Skipping undefined or invalid source:", source);
        return null;
      }

      try {
        const filePath = `${dir}/${source.source}`;
        console.log(`Fetching markdown for: ${filePath}`);

        // Fetch markdown
        const result = await this.fetchMarkdownWithFrontmatter(filePath, source.content_name);

        console.log(`Raw result from fetchMarkdownWithFrontmatter for ${source.source}:`, result);

        // Check if the key matching `content_name` exists in the returned object
        if (!result || !result[source.content_name]) {
          console.warn(`No content found for ${source.source} under key: ${source.content_name}`);
          return null;
        }

        // Construct structured source data object
        return {
          [source.content_name]: result[source.content_name],  // Use the actual key dynamically
          ...result // Include all frontmatter fields
        };
      } catch (error) {
        console.error(`Error processing source ${source.source}:`, error);
        return null;
      }
    });

    // Wait for all markdown processing to complete
    const source_data = (await Promise.all(sourcesPromises)).filter(Boolean);

    // Ensure finalData is a new object that keeps original data
    const finalData = { ...data, source_data };

    console.log("Final processed data:", finalData);

    // Fetch template if provided
    const templateHtml = template ? await this.fetchFile(`./templates/${template}`) : '';

    // Render template using Mustache
    console.log("Passing to Mustache:", JSON.stringify(finalData, null, 2));
    const rendered = Mustache.render(templateHtml, finalData);

    // const rendered = Mustache.render(templateHtml, { data: finalData });
    slotElement.innerHTML = rendered;
  }






  async loadPlugins(pluginConfigs) {
    for (const { path, css, js } of pluginConfigs) {
      if (css) await this.loadCSS(`${path}/${css}`);
      const pluginPath = `${window.location.origin}${window.location.pathname}plugins/${path}/plugin.js`;
      const pluginModule = await import(pluginPath);
      if (typeof pluginModule.default === 'function') pluginModule.default();
    }
  }

  loadCSS(cssPath) {
    return new Promise((resolve, reject) => {
      const fullPath = `${window.location.origin}${window.location.pathname}plugins/${cssPath}`;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fullPath;
      link.onload = () => resolve();
      link.onerror = () => reject();
      document.head.appendChild(link);
    });
  }
}

const router = new ClientSideRouter();
