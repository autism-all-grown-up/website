const relativePath = (base_path, full_path) => {

  const escaped_base_path = base_path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return full_path
    .replace(new RegExp('^' + escaped_base_path), '')
    .replace(/\/$/, ''); // strip any trailing '/'
}

// function isLocal(href) {
//   console.log(`isLocal: ${href}`);

//   // Get the referrer (the URL of the previous page)
//   let referrer = document.referrer;
//   let hostname = window.location.hostname;
//   let origin = window.location.origin;
//   let protocol = window.location.protocol;
//   let host_url = `${protocol}//${hostname}`;

//   // Check if the referrer is empty or from a search engine (indicative of organic visit)
//   if (!referrer || referrer === "") {
//     referrer = host_url;
//   }

//   console.log({referrer});

//   // Parse the referrer to get its domain
//   let referrerDomain = (new URL(referrer)).hostname;
//   let currentDomain = window.location.hostname;

//   // Check if the visit is from the same domain
//   if (referrerDomain === currentDomain) {
//     console.log("This is an internal visit (from another page on the same website).");
//     return true;
//   } else {
//     console.log("This is likely a referral from another site.");
//     return false;
//   }
// }

function isLocal() {
  const referrer = document.referrer;
  const currentOrigin = window.location.origin; // e.g., 'https://example.com'

  // Check if there is no referrer or if the referrer is from a different domain
  if (!referrer || !referrer.startsWith(currentOrigin)) {
    // This is an organic visit (e.g., directly typed URL or from an external source)
    console.log("This is likely a directly typed URL or a referral from another site.");
    return false;
  }

  // If the referrer is from the same origin, this is an internal navigation
  console.log("This is an internal visit (from another page on the same website).");
  return true;
}

// Function to get the query parameter from the URL
// This function extracts the value of a given query parameter (e.g., 'page') from the URL.
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param); // Return the value of the requested query parameter
}

async function getPath(href) {
  // const url = 'https://example.com/path/to/page?query=123#section';

  // // Split the URL at the first single slash after the domain
  // const everythingAfterDomain = url.split('/').slice(3).join('/');
  // console.log(everythingAfterDomain);

  const url_object = new URL(currentUrl);
  // console.log({url_object});

}


async function renderContent(path) {
  // console.log(`renderContent: ${path}`);

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

  console.log(JSON.stringify(data, null, 2));

  let rendered = "";
  if (template) {
    console.log(`got nonempty template for slot: ${slot}, ${template}`);
    console.log(JSON.stringify(data, null, 2));

    const templateHtml = await fetchFile(`./templates/${template}`);
    console.log(`template html: \n${templateHtml}`);

    rendered = Mustache.render(templateHtml, { data: data });
    // console.log(`rendered: ${rendered}`);
  }

  console.log(rendered);
  console.log({slot});
  let target_element = document.querySelector(`#${slot}`)
  target_element.innerHTML = rendered;

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

// Set the active link by adding/removing the 'active' class based on the current query
// This function highlights the correct navigation link by comparing the current query parameter
// with the href attribute of each link.
function setActiveLink(targetPage) {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    // Compare the href's query to the current query and add/remove 'active' class accordingly
    const hrefQuery = new URLSearchParams(link.getAttribute('href')).get('page');
    if (hrefQuery === targetPage) {
      link.classList.add('active'); // Add active class to the current page link
    } else {
      link.classList.remove('active'); // Remove active class from other links
    }
  });
}

// Get the current page URL
let currentUrl = window.location.path;
console.log({ currentUrl });
console.log(`is local? ${isLocal(currentUrl)}`);

// Function to check if a link is external
function isExternalLink(link) {
  console.log(`isExternalLink: ${link}`);
  const linkHost = new URL(link.href).host;
  const currentHost = window.location.host;

  let is_external = linkHost !== currentHost;
  console.log({ linkHost, currentHost, is_external});

  return is_external;
}

// Function to handle navigation on query-based links (client-side routing)
// When a link is clicked, this function updates the content dynamically without reloading the page.
function handleLinks(event) {
  console.log("document clicked");
  console.log({ event });

  const targetElement = event.target;
  console.log({ targetElement });

  if (targetElement.nodeName == 'A') {
    console.log(`got a link: ${targetElement}`);

    const url = targetElement.href;
    console.log({ url })

    // Check if the link is external  
    if (isExternalLink(targetElement)) {
      console.log(`got external link: {targetElement.href}`);

      return; // Let the default behavior happen (e.g., open the external link)
    }

    event.preventDefault(); // Prevent default behavior for internal links

    // Extract the query parameter from the link's href
    console.log({ targetElement });
    console.log(`href: ${targetElement.href}`);

    const targetPage = new URL(targetElement.href).searchParams.get('page') || 'home';
    console.log({ targetPage });

    // Only proceed if the target page is different from the current query
    if (window.location.search !== `?page=${targetPage}`) {
      renderContent(targetPage); // Load specific page content (main content)
      setActiveLink(targetPage); // Highlight the correct active link in nav
      window.history.pushState(null, '', `?page=${targetPage}`); // Update the URL without reloading the page
    }
  }
}

window.addEventListener("load", () => {
  // window.addEventListener('DOMContentLoaded', async () => {

  if (!isLocal(currentUrl)) {
    // console.log("rendering default content");

    // renderContent("default");
  }

  console.log("rendering default content");
  renderContent("default");

  // Initial page load: handle direct access by checking the current query parameter
  const current_page = new URL(window.location.href).searchParams.get('page') || 'home';
  console.log(`rendering content for page: ${current_page}`);
  renderContent(current_page); // Load specific content for the current query
  setActiveLink(current_page); // Set the correct active link based on the current query

  // Event delegation: listen for all clicks on the document body (for links)
  document.addEventListener('click', handleLinks);

  // Array.from(document.links)
  //   .filter(link => link.hostname != window.location.hostname)
  //   .forEach(link => link.target = '_blank');

  // Array.from(document.querySelectorAll('a'))
  //   .filter(link => link.hostname != window.location.hostname)
  //   .forEach(link => link.target = '_blank');

  // Handle back/forward navigation with the popstate event
  // This ensures the correct content is loaded when using the browser's back/forward buttons.
  window.addEventListener('popstate', () => {
    const pathQuery = getQueryParam('page') || 'home'; // Default to 'home' if no query
    renderContent(pathQuery); // Load content for the specific route
    setActiveLink(pathQuery); // Set active state on the correct navigation link
  });


  const links = [...document.querySelectorAll('a')];
  console.log({ links });
  links
    .filter(link => link.hostname != window.location.hostname)
    .forEach(link => link.target = '_blank');

});
