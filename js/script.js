/*
// Import Mustache and Marked from the assets directory (ESM versions)
import Mustache from '../assets/mustache.esm.js';
import { marked } from '../assets/marked.esm.js';
import { gfmHeadingId } from '../assets/marked-gfm-heading-id/index.esm.js';
import { customHeadingId } from '../assets/marked-custom-heading-id/index.esm.js';

// Configure marked with the plugins
const options = {
    // prefix: "my-prefix-",
};
marked.use(gfmHeadingId(options));
marked.use(customHeadingId());
*/

// Import libraries from CDN in ESM mode
import Mustache from 'https://esm.run/mustache';
import { marked } from 'https://esm.run/marked';
import { gfmHeadingId } from 'https://esm.run/marked-gfm-heading-id';
// import { customHeadingId } from 'https://esm.run/marked-custom-heading-id';
// Import marked-custom-heading-id as the default export
import customHeadingId from 'https://esm.run/marked-custom-heading-id';
import YAML from 'https://esm.run/js-yaml';

console.log(YAML);  

// Configure Marked with plugins
const options = { /* custom options */ };
marked.use(gfmHeadingId(options));
marked.use(customHeadingId());

class ClientSideRouter {  
  constructor() {
    this.currentUrl = window.location.path;
    this.init();
  }

  // Initialize the client-side router
  init() {
    window.addEventListener('load', this.onLoad.bind(this));
    window.addEventListener('popstate', this.onPopState.bind(this));
    document.addEventListener('click', this.handleLinks.bind(this));
  }

  parseMarkdownWithYaml(markdown) {
    // Adjust regex to handle different newline characters and ensure it matches frontmatter accurately
    const regex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = regex.exec(markdown);
  
    if (match) {
      try {
        const yamlData = YAML.load(match[1]);
        const content = markdown.slice(match[0].length);
        return { metadata: yamlData, content };
      } catch (error) {
        console.error('Error parsing YAML frontmatter:', error);
        return { metadata: {}, content: markdown };
      }
    } else {
      return { metadata: {}, content: markdown };
    }
  }
  
  

  // Load default or specific content based on the current URL
  async onLoad() {
    // Load the global configuration
    this.globalConfig = await this.fetchFile("config.json", "json");
    const config = this.globalConfig;
    // console.log({ config });

    // Render the default content
    await this.renderQuery('default');

    const currentPage = this.getQueryParam('page') || 'home';
    // Render the content for the current page
    await this.renderQuery(currentPage);
    this.setActiveLink(currentPage);

    // Handle scrolling based on the current location
    this.scrollToLocation();

  }

  // Function to scroll to the appropriate location
  scrollToLocation() {
    const { hash } = window.location;

    if (hash) {
      // console.log(`scroll to ${hash}`);

      // Scroll to the element with the matching ID
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        const topPosition = document.querySelector('nav').offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - topPosition;

        // Smoothly scroll to the calculated position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // console.log(`scroll to top`);
      // No hash in the URL, scroll to the top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Handle browser back/forward button
  async onPopState() {
    const pathQuery = this.getQueryParam('page') || 'home';
    await this.renderQuery(pathQuery);
    this.setActiveLink(pathQuery);

    // Handle scrolling based on the current location
    this.scrollToLocation();
  }

  // Handle click events on links
  async handleLinks(event) {
    const targetElement = event.target;
    if (targetElement.nodeName === 'A' && !this.isExternalLink(targetElement)) {
      event.preventDefault();

      const targetPage = new URL(targetElement.href).searchParams.get('page') || 'home';

      if (window.location.search !== `?page=${targetPage}`) {
        await this.renderQuery(targetPage);
        this.setActiveLink(targetPage);
        window.history.pushState(null, '', `?page=${targetPage}`);

        // Handle scrolling based on the current location
        this.scrollToLocation();
        this.collapseMenu();
      }
    }

    // **Send a page view to Google Analytics**
    gtag('config', 'G-RND4D70EJW', {
      'page_path': window.location.pathname + window.location.search
    });
  }

  // Collapse the menu (if applicable)
  collapseMenu() {
    const dropCheckbox = document.getElementById('drop');
    if (dropCheckbox && dropCheckbox.checked) {
      dropCheckbox.checked = false;
    }
  }

  // Check if a link is external
  isExternalLink(link) {
    return new URL(link.href).host !== window.location.host;
  }

  // Get query parameter
  getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  // Set active link in the navigation
  setActiveLink(targetPage) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      const hrefQuery = new URLSearchParams(link.getAttribute('href')).get('page');
      link.classList.toggle('active', hrefQuery === targetPage);
    });
  }

  // Fetch a file (text or JSON)
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
    // console.log({config});

    // First, render page-specific content
    if (config) {
      for (const slotConfig of config) {
        // console.log({slotConfig});

        await this.renderSlot(slotConfig, contentDir);
        if (slotConfig.plugins) {
          const plugins = slotConfig.plugins;
          // console.log({plugins});

          await this.loadPlugins(slotConfig.plugins);  // Load page-specific plugins
        }
      }
    }

    // Ensure all default plugins are loaded after page-specific plugins
    if (this.globalConfig && this.globalConfig.default_plugins) {
      const config = this.globalConfig;
      // console.log({ config });
      await this.loadPlugins(this.globalConfig.default_plugins);  // Load default plugins
    }

  }

  // Render a slot (template or content area)
  async renderSlot({ slot, template, data }, dir) {
    // console.log("renderSlot");
    // console.log({ slot, template, data, dir });

    if (!slot || !document.querySelector(`#${slot}`)) {
      console.error('Slot element missing or config error:', slot);
      return;
    }

    const promises = data.map(async item => {
      if (item.source_data) {
        await Promise.all(item.source_data.map(async source => {
          item[source.content_name] = await this.convertMarkdownToHtml(`${dir}/${source.source}`);
        }));
      }
    });

    await Promise.all(promises);

    const templateHtml = template ? await this.fetchFile(`./templates/${template}`) : '';
    const rendered = Mustache.render(templateHtml, { data });
    document.querySelector(`#${slot}`).innerHTML = rendered;
  }

  // Convert markdown to HTML
  async convertMarkdownToHtml(filePath) {
    const markdown = await this.fetchFile(filePath);
    const { metadata, content } = this.parseMarkdownWithYaml(markdown);
    console.log({metadata, content});

    return marked.parse(content || '');
  }

  // Load plugins dynamically
  loadCSS(cssPath) {
    return new Promise((resolve, reject) => {
      // Only concatenate the relative path for the CSS file
      const fullPath = `${window.location.origin}${window.location.pathname}plugins/${cssPath}`;
      // console.log({ fullPath });

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fullPath;

      link.onload = () => {
        console.log(`${fullPath} loaded successfully.`);
        resolve();
      };
      link.onerror = () => {
        console.error(`Failed to load stylesheet ${fullPath}`);
        reject();
      };

      document.head.appendChild(link);
    });
  }

  async loadPlugins(pluginConfigs) {
    for (const { path, css, js } of pluginConfigs) {
      // console.log({ path, css, js });
      try {
        // Load CSS if specified
        if (css) await this.loadCSS(`${path}/${css}`);

        // Load the plugin.js file (which will handle whether to load a module or non-module script)
        const pluginPath = `${window.location.origin}${window.location.pathname}plugins/${path}/plugin.js`;

        const pluginModule = await import(pluginPath);
        if (typeof pluginModule.default === 'function') {
          pluginModule.default();  // Run the logic defined by the developer
        }
      } catch (error) {
        console.error(`Error loading plugin from ${path}`, error);
      }
    }
  }

}

// Initialize the client-side router
const router = new ClientSideRouter();
