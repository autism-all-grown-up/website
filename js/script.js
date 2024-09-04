// Fetch utilities
// Function to fetch either text or JSON files from the server.
// - file_path: Path to the file being fetched
// - dataType: 'text' (default) or 'json' to indicate the format of the file
// If the fetch is successful, it returns the file's content; otherwise, it logs an error.
async function fetchFile(file_path, dataType = 'text') {
  try {
    const response = await fetch(file_path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file_path}: ${response.status} ${response.statusText}`);
    }
    return dataType === 'json' ? response.json() : response.text();
  } catch (error) {
    console.error(`Error reading ${dataType} file:`, error);
    return null;
  }
}

// Markdown to HTML conversion
// Converts a markdown file into HTML using the Marked library.
// - file_path: Path to the markdown file
// Returns the HTML string converted from markdown content.
async function convertMarkdownToHtml(file_path) {
  const markdown = await fetchFile(file_path);
  return marked.parse(markdown || '');
}

// Template rendering logic
// This function renders a template by replacing placeholders with dynamic data.
// - template: Name of the template file to be rendered
// - subdir: Optional subdirectory where the content is stored
// Fetches the corresponding config file for the template, loads any markdown content, and renders the template.
async function renderTemplate(template, subdir = '') {
  const contentDir = `./content/${subdir || template}`;
  const config = await fetchFile(`${contentDir}/config.json`, 'json');
  if (!config || !document.querySelector(`#${config.target}`)) {
    console.error('Configuration error or target element missing:', config);
    return;
  }

  // Loop through the data in the config file and load markdown if necessary
  const promises = config.data.map(async item => {
    if (item.source_data) {
      await Promise.all(item.source_data.map(async source => {
        item[source.content_name] = await convertMarkdownToHtml(`${contentDir}/${source.source}`);
      }));
    }
  });

  await Promise.all(promises);
  const templateHtml = await fetchFile(`./templates/${config.template}`);
  document.querySelector(`#${config.target}`).innerHTML = Mustache.render(templateHtml, { data: config.data });
}

// Event delegation function
// This function adds an event listener to a parent element, allowing the capture of events on dynamically created child elements.
// - parentSelector: CSS selector for the parent element
// - eventType: The type of event to listen for (e.g., 'click')
// - childSelector: CSS selector for the child elements that should trigger the event
// - callback: Function to run when the event is triggered on a child element
function delegateEvent(parentSelector, eventType, childSelector, callback) {
  const parent = document.querySelector(parentSelector);
  if (parent) {
    parent.addEventListener(eventType, function(event) {
      const targetElement = event.target.closest(childSelector);
      if (targetElement) {
        callback(event, targetElement);  // Call the callback function, passing the event and target element
      }
    });
  }
}

// Dynamic Plugin Loading and Initialization with Event Handling
// Dynamically loads plugin modules and attaches event listeners for each plugin.
// - pluginConfigs: Array of plugin configurations (each specifying path, event, parent, target, and callback)
// Loads the plugin, attaches the event listener using delegateEvent, and logs the plugin loaded.
async function loadPlugins(pluginConfigs) {
  for (const {path, event, parent, target, callback} of pluginConfigs) {
    try {
      const module = await import(`../plugins/${path}.js`);
      if (module && module.default) {
        const callbackFunction = (evt, elem) => module.default(evt, elem);
        delegateEvent(parent, event, target, callbackFunction);  // Attach the event listener
        console.log(`Plugin loaded: ${path} with event: ${event}`);
      }
    } catch (error) {
      console.error(`Error loading plugin ${path}:`, error);
    }
  }
}

// Initialization on window load
// This function waits for the DOM to be fully loaded and then renders the templates and loads the plugins based on the config file.
window.addEventListener('DOMContentLoaded', async () => {
  const config = await fetchFile('./config.json', 'json');
  console.log("Configuration loaded:", config);

  // Render all templates listed in the config file
  if (config.render) {
    for (const item of config.render) {
      await renderTemplate(item.template, item.dir);
    }
  }

  // Load all plugins listed in the config file
  if (config.plugins) {
    await loadPlugins(config.plugins);
  }
});
