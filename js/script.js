const relativePath = (base_path, full_path) => {

  const escaped_base_path = base_path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return full_path
          .replace(new RegExp('^' + escaped_base_path), '')
          .replace(/\/$/, ''); // strip any trailing '/'
}

function isLocal(href) {
  // console.log(`isLocal: ${href}`);

  // Get the referrer (the URL of the previous page)
  var referrer = document.referrer;

  // Check if the referrer is empty or from a search engine (indicative of organic visit)
  if (!referrer || referrer === "") {
    console.log("This is likely a direct or organic visit.");

    return false;
  } else {
    // Parse the referrer to get its domain
    var referrerDomain = (new URL(referrer)).hostname;
    var currentDomain = window.location.hostname;

    // Check if the visit is from the same domain
    if (referrerDomain === currentDomain) {
      console.log("This is an internal visit (from another page on the same website).");
      return true;
    } else {
      console.log("This is likely a referral from another site.");
      return false;
    }
  }
}

async function getPath(href) {
  // const url = 'https://example.com/path/to/page?query=123#section';

  // // Split the URL at the first single slash after the domain
  // const everythingAfterDomain = url.split('/').slice(3).join('/');
  // console.log(everythingAfterDomain);

  const url_object = new URL(currentUrl);
  // console.log({url_object});

}


async function renderPage(path) {
  // console.log(`renderPage: ${path}`);

  const content_dir = `content/${path}`;

  const config = await fetchFile(`${content_dir}/config.json`, 'json');
  // console.log("Configuration loaded:", config);

  config.map(async slot_config => {
    // console.log({slot_config});

    // Render all templates listed in the config file
    await renderSlot(slot_config, content_dir);

    if (slot_config.plugins) {
      let plugins = slot_config.plugins;
      // console.log({plugins});
      await loadPlugins(plugins);
    }

  });

}

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
async function renderSlot({ slot, template, data, action }, dir) {

  // console.log({slot, template, data, action});
  // console.log({dir});

  // const contentDir = `content/${dir}`;
  // console.log({contentDir});


  if (!slot || !document.querySelector(`#${slot}`)) {
    console.error('Configuration error or slot element missing:', { slot, template, data, action, dir });
    return;
  }

  // Loop through the data in the config file and load markdown if necessary
  const promises = data.map(async item => {
    if (item.source_data) {
      await Promise.all(item.source_data.map(async source => {
        item[source.content_name] = await convertMarkdownToHtml(`${dir}/${source.source}`);
      }));
    }
  });

  await Promise.all(promises);
  const templateHtml = await fetchFile(`./templates/${template}`);
  if (data.length == 1){
    data = data[0];
  }
  // console.log(JSON.stringify(data, null, 2));
  document.querySelector(`#${slot}`).innerHTML = Mustache.render(templateHtml, { data: data });
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
    parent.addEventListener(eventType, function (event) {
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
  // console.log({pluginConfigs});

  for (const { path, event, parent, target, callback } of pluginConfigs) {
    try {
      const module = await import(`../plugins/${path}.js`);
      if (module && module.default) {
        const callbackFunction = (evt, elem) => module.default(evt, elem);
        delegateEvent(parent, event, target, callbackFunction);  // Attach the event listener
        console.log(`Plugin loaded: ${path} with event: ${event}`);
      }
    } catch (error) {
      // console.error(`Error loading plugin ${path}:`, error);
    }
  }
}

// Get the current page URL
let currentUrl = window.location.href;
console.log({ currentUrl });

// let path = currentUrl.split('/').slice(4).join('/');
// console.log({path});

let is_local = isLocal(currentUrl);
console.log({is_local});

let page = window.location.search.replace(/^\?/, '');
// let page = window.location.href.split('/').slice(-1).replace(/^\?/, '');
console.log({page});

// Initialization on window load
// This function waits for the DOM to be fully loaded and then renders the templates and loads the plugins based on the config file.
window.addEventListener('DOMContentLoaded', async () => {

  // if (!is_local) {
  //   console.log('local request: rendering default');
  //   await renderPage('default');
  // }

  await renderPage('default');
  await renderPage(page || "home");

});
