class URLTools {
  // Check if a given link is external by comparing its host with the current page's host
  static isExternalLink(link) {
    const linkHost = new URL(link).host;
    const currentHost = window.location.host;
    return linkHost !== currentHost;
  }

  // Get the value of a query parameter from the current page's URL
  static getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Get the full URL including query parameters for a given path
  static getFullURL(path) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/${path}`;
  }
}

class ResourceLoader {
  // Load CSS dynamically and wait for it to finish loading
  static loadCSS(filePath) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = filePath;
      link.onload = () => {
        console.log(`CSS loaded: ${filePath}`);
        resolve();
      };
      link.onerror = () => {
        console.error(`Failed to load CSS: ${filePath}`);
        reject();
      };
      document.head.appendChild(link);
    });
  }

  // Load JS dynamically
  static loadJS(filePath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = filePath;
      script.async = true;
      script.onload = () => {
        console.log(`JS loaded: ${filePath}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load JS: ${filePath}`);
        reject();
      };
      document.head.appendChild(script);
    });
  }
}

class FileFetcher {
  // Fetch a file from the specified path, returning content in the specified data type
  static async fetchFile(filePath, dataType = 'text') {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${filePath}`);
      }

      // Handle different data types
      switch (dataType) {
        case 'json':
          return await response.json();
        case 'text':
          return await response.text();
        case 'html': 
          return await response.text(); // HTML can be handled as text
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }
    } catch (error) {
      console.error(`Error fetching file: ${filePath}`, error);
      return null;
    }
  }
}

class ContentRenderer {
  constructor() {
    this.marked = window.marked;
    this.mustache = window.Mustache;
  }

  // Convert Markdown content into HTML using the Marked library
  async renderMarkdown(filePath) {
    const markdownContent = await FileFetcher.fetchFile(filePath, 'text');
    if (!markdownContent) {
      console.error(`Failed to load markdown file: ${filePath}`);
      return '';
    }
    return this.marked.parse(markdownContent);
  }

  // Render a Mustache template with the provided data
  async renderTemplate(templatePath, data) {
    const templateContent = await FileFetcher.fetchFile(templatePath, 'text');
    if (!templateContent) {
      console.error(`Failed to load template file: ${templatePath}`);
      return '';
    }
    return this.mustache.render(templateContent, data);
  }
}

class ClientSideRouter {
  constructor() {
    console.log("constructor");

    this.currentUrl = window.location.pathname;
    this.contentRenderer = new ContentRenderer();
    this.config = {}; // Placeholder for configuration
    this.loadedPlugins = new Set(); // Track loaded plugins to prevent duplicates
    this.loadedSlots = new Set(); // Track loaded slots to prevent duplicate rendering
    this.init();
  }

  async init() {
    console.log("init");

    console.log("loading main config");
    await this.loadConfig();

    console.log("adding event listeners");
    window.addEventListener('load', this.onLoad.bind(this));
    window.addEventListener('popstate', this.onPopState.bind(this));
    document.addEventListener('click', this.handleLinks.bind(this));
  }

  async loadConfig() {
    try {
      this.config = await FileFetcher.fetchFile('config.json', 'json');
      console.log('Config loaded:', this.config);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async onLoad() {
    console.log("onLoad");

    const defaultPage = this.config.default_page || 'default';
    console.log({defaultPage});
    await this.renderContent(defaultPage);

    const currentPage = URLTools.getQueryParam('page') || 'home';
    console.log({currentPage});
    await this.renderContent(currentPage);
    
    this.setActiveLink(currentPage);

    // Load default plugins
    await this.loadPlugins(this.config.default_plugins || []);
  }

  async onPopState() {
    const pathQuery = URLTools.getQueryParam('page') || this.config.default_page || 'default';
    await this.renderContent(pathQuery);
    this.setActiveLink(pathQuery);
  }

  async handleLinks(event) {
    const targetElement = event.target;
    if (targetElement.nodeName === 'A' && !URLTools.isExternalLink(targetElement.href)) {
      event.preventDefault();

      const targetPage = new URL(targetElement.href).searchParams.get('page') || this.config.default_page || 'home';
      if (window.location.search !== `?page=${targetPage}`) {
        await this.renderContent(targetPage);
        this.setActiveLink(targetPage);
        window.history.pushState(null, '', `?page=${targetPage}`);
        await this.loadPlugins(this.config.default_plugins || []);
      }
    }
  }

  setActiveLink(targetPage) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      const hrefQuery = new URLSearchParams(link.getAttribute('href')).get('page');
      link.classList.toggle('active', hrefQuery === targetPage);
    });
  }

  async renderContent(path) {
    const contentDir = `content/${path}`;
    const config = await FileFetcher.fetchFile(`${contentDir}/config.json`, 'json');
    if (!config) return;

    for (const slotConfig of config) {
      if (this.loadedSlots.has(slotConfig.slot)) {
        continue;
      }
      await this.renderSlot(slotConfig, contentDir);
      this.loadedSlots.add(slotConfig.slot);
    }
  }

  async renderSlot({ slot, template, data }, dir) {
    const slotElement = document.querySelector(`#${slot}`);
    if (!slot || !slotElement) {
      return;
    }
    const rendered = await this.contentRenderer.renderTemplate(`templates/${template}`, { data });
    slotElement.innerHTML = rendered;
  }

  // Updated method to handle missing plugins gracefully
  async loadPlugins(pluginConfigs) {
    for (const path of pluginConfigs) {
      if (this.loadedPlugins.has(path)) continue;

      try {
        // Load CSS gracefully
        await ResourceLoader.loadCSS(`/plugins/${path}/${path}.css`).catch(() => {
          console.warn(`CSS file not found for plugin: ${path}, continuing...`);
        });

        // Load JS module
        const module = await import(`../plugins/${path}/plugin.js`).catch(() => {
          console.warn(`JS module not found for plugin: ${path}, skipping plugin.`);
          return null; // Skip the rest of the plugin processing
        });

        if (!module) continue; // Skip if module is missing

        // Load JS gracefully
        await ResourceLoader.loadJS(`/plugins/${path}/${path}.js`).catch(() => {
          console.warn(`JS file not found for plugin: ${path}, continuing...`);
        });

        if (module.default) {
          await module.default();
          console.log(`Plugin loaded and executed: ${path}`);
        }

        this.loadedPlugins.add(path);
      } catch (error) {
        console.error(`Error loading plugin ${path}:`, error);
      }
    }
  }
}

// Initialize the client-side router
const router = new ClientSideRouter();
router.init();