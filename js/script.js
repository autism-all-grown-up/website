const relativePath = (base_path, full_path) => {

  const escaped_base_path = base_path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return full_path
    .replace(new RegExp('^' + escaped_base_path), '')
    .replace(/\/$/, ''); // strip any trailing '/'
}

// Function to check if a link is external
function isLocal(link) {
  const linkHost = new URL(link.href).host;
  const currentHost = window.location.host;
  return linkHost == currentHost;
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

  const contentDir = `content/${dir}`;
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
  if (data.length == 1) {
    data = data[0];
  }

  // console.log(JSON.stringify(data, null, 2));
  let rendered = Mustache.render(templateHtml, { data: data });
  // console.log(rendered);
  // console.log({slot});

  let target_element = document.querySelector(`#${slot}`)
  target_element.innerHTML = rendered;
  // document.querySelector('#main').offsetHeight; // Reflow trigger
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
      console.error(`Error loading plugin ${path}:`, error);
    }
  }
}

// Get the current page URL
let currentUrl = window.location.href;
console.log({ currentUrl });

// let path = currentUrl.split('/').slice(4).join('/');
// console.log({path});

let is_local = isLocal(currentUrl);
console.log({ is_local });

let page = window.location.search.replace(/^\?/, '');
// let page = window.location.href.split('/').slice(-1).replace(/^\?/, '');
// console.log({page});

// Initialization on window load
// This function waits for the DOM to be fully loaded and then renders the templates and loads the plugins based on the config file.
window.addEventListener('DOMContentLoaded', async () => {
  // window.onload = async function(){
  console.log("DOMContentLoaded");

  // if (!is_local) {
  //   console.log('local request: rendering default');
  //   await renderPage('default');
  // }

  await renderPage('default');
  await renderPage(page || "home");

  // }
});








window.addEventListener("load", () => {
  const queryString = window.location.search;
  console.log(`query: ${queryString}`);

  // Load content based on the initial query
  if (!queryString || queryString.trim() === '') {
    mainElement.innerHTML = homeContent;
  } else {
    mainElement.innerHTML = otherContent;
  }



  // New function: Set the target link to active and remove active from others
  function setActiveLink(targetPage) {
    const navLinks = document.querySelectorAll('nav a'); // Target all nav links

    navLinks.forEach(link => {
      // If the link's href matches the targetPage, set it as active
      if (link.getAttribute('href') === targetPage) {
        link.classList.add('active');
      } else {
        // Remove active state from all other links
        link.classList.remove('active');
      }
    });
  }

  // Modified function to handle internal navigation logic
  // Function to handle internal navigation logic
  function handleInternalNavigation(event) {
    const targetElement = event.target;

    if (targetElement.matches('a')) {
      if (isExternalLink(targetElement)) {
        return; // Allow external links
      }

      event.preventDefault(); // Prevent page reload for internal links

      const targetPage = targetElement.getAttribute('href');

      // Only push state if the target page is different from the current URL
      if (window.location.pathname !== targetPage) {
        console.log(`Navigating to: ${targetPage}`);

        mainElement.innerHTML = routing_table[targetPage] || '';
        setActiveLink(targetPage);
        window.history.pushState(null, '', targetPage);
      }
    }
  }


  // Event delegation: listen for clicks on the body element
  document.body.addEventListener('click', handleInternalNavigation);

  // Handle back/forward navigation with the popstate event
  window.addEventListener('popstate', (event) => {
    const pathQuery = window.location.pathname;
    mainElement.innerHTML = routing_table[pathQuery] || '';

    // Set the link for the current page as active
    setActiveLink(pathQuery);
  });
});