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
  
    // Load default or specific content based on the current URL
    async onLoad() {
      console.log('Rendering default content');
      await this.renderContent('default');
  
      const currentPage = this.getQueryParam('page') || 'home';
      console.log(`Rendering content for page: ${currentPage}`);
      await this.renderContent(currentPage);
      this.setActiveLink(currentPage);
      this.setupExternalLinks();
    }
  
    // Handle browser back/forward button
    async onPopState() {
      const pathQuery = this.getQueryParam('page') || 'home';
      await this.renderContent(pathQuery);
      this.setActiveLink(pathQuery);
    }
  
    // Handle click events on links
    async handleLinks(event) {
      const targetElement = event.target;
      if (targetElement.nodeName === 'A' && !this.isExternalLink(targetElement)) {
        event.preventDefault();
  
        const targetPage = new URL(targetElement.href).searchParams.get('page') || 'home';
        if (window.location.search !== `?page=${targetPage}`) {
          await this.renderContent(targetPage);
          this.setActiveLink(targetPage);
          window.history.pushState(null, '', `?page=${targetPage}`);
          this.collapseMenu();
        }
      }
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
  
    // Render content for a given page
    async renderContent(path) {
      const contentDir = `content/${path}`;
      const config = await this.fetchFile(`${contentDir}/config.json`, 'json');
      if (!config) return;
  
      for (const slotConfig of config) {
        await this.renderSlot(slotConfig, contentDir);
        if (slotConfig.plugins) await this.loadPlugins(slotConfig.plugins);
      }
    }
  
    // Render a slot (template or content area)
    async renderSlot({ slot, template, data }, dir) {
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
      return marked.parse(markdown || '');
    }
  
    // Load plugins dynamically
    async loadPlugins(pluginConfigs) {
      for (const { path, event, parent, target } of pluginConfigs) {
        try {
          const module = await import(`../plugins/${path}.js`);
          const callbackFunction = (evt, elem) => module.default(evt, elem);
          this.delegateEvent(parent, event, target, callbackFunction);
        } catch (error) {
          console.error(`Error loading plugin ${path}`, error);
        }
      }
    }
  
    // Delegate events to dynamically created elements
    delegateEvent(parentSelector, eventType, childSelector, callback) {
      const parent = document.querySelector(parentSelector);
      if (parent) {
        parent.addEventListener(eventType, function (event) {
          const targetElement = event.target.closest(childSelector);
          if (targetElement) callback(event, targetElement);
        });
      }
    }
  
    // Set external links to open in a new tab
    setupExternalLinks() {
      [...document.querySelectorAll('a')].filter(link => this.isExternalLink(link))
        .forEach(link => link.target = '_blank');
    }
  }
  
  // Initialize the client-side router
  const router = new ClientSideRouter();
  