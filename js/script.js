import Mustache from 'https://esm.run/mustache';
import { marked } from 'https://esm.run/marked';
import YAML from 'https://esm.run/js-yaml';

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
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(markdown);
    if (match) {
      const frontmatter = YAML.load(match[1]);
      const content = match[2];
      return { frontmatter, content };
    }
    return { frontmatter: {}, content: markdown };
  }

  async fetchMarkdownWithFrontmatter(sourceUrl, contentName) {
    const response = await fetch(sourceUrl);
    const markdown = await response.text();
    const { frontmatter, content } = this.parseFrontmatter(markdown);
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
    const contentDir = `content/${path}`;
    const config = await this.fetchFile(`${contentDir}/config.json`, 'json');

    if (config) {
      for (const slotConfig of config) {
        await this.renderSlot(slotConfig, contentDir);
        if (slotConfig.plugins) {
          await this.loadPlugins(slotConfig.plugins);
        }
      }
    }

    if (this.globalConfig && this.globalConfig.default_plugins) {
      await this.loadPlugins(this.globalConfig.default_plugins);
    }
  }

  async renderSlot({ slot, template, data }, dir) {
    const slotElement = document.getElementById(slot);
    if (!slotElement) {
      console.error('Slot element missing:', slot);
      return;
    }

    const dataElements = Array.isArray(data) ? data : [data];
    const dataPromises = dataElements.map(async dataElement => {
      // Ensure sources is defined and an array
      const sources = Array.isArray(dataElement.sources) ? dataElement.sources : [dataElement.sources].filter(Boolean);

      const sourcesPromises = sources.map(source => {
        // Ensure source is defined and has a 'source' property
        if (source && source.source) {
          return this.fetchMarkdownWithFrontmatter(`${dir}/${source.source}`, source.content_name);
        }
        console.warn("Skipping undefined source:", source);
        return Promise.resolve({}); // Return an empty object if source is invalid
      });

      const sourcesData = await Promise.all(sourcesPromises);
      return Object.assign(dataElement, ...sourcesData);
    });

    const finalData = await Promise.all(dataPromises);
    const templateHtml = template ? await this.fetchFile(`./templates/${template}`) : '';
    const rendered = Mustache.render(templateHtml, { data: finalData });
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
