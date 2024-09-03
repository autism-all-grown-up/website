async function readJsonFile(file_path) {
  // console.log(`readJsonFile file_path: ${file_path}`);

  try {
    const response = await fetch(file_path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file_path}: ${response.status} ${response.statusText}`);
    }
    const json_data = await response.json();
    return json_data;
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return null;
  }
}

async function readTextFile(file_path) {
  // console.log(`readTextFile file_path: ${file_path}`);
  try {
    const response = await fetch(file_path); ``
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file_path}: ${response.status} ${response.statusText}`);
    }
    const text_data = await response.text();
    return text_data;
  } catch (error) {
    console.error("Error reading text file:", error);
    return null;
  }
}

async function readMarkdownFileToHTML(file_path) {
  // console.log(`readMarkdownFileToHTML file_path: ${file_path}`);

  const markdown = await readTextFile(file_path);
  // console.log(markdown);
  const html = marked.parse(markdown);
  // console.log(html);
  return html;
}

const renderTemplate = async (
  template,
  content_subdirectory = null,
  config_data_file = "config.js",
  renderCustom = null
) => {

  console.log({ template, content_subdirectory, config_data_file, renderCustom });

  if (renderCustom) {
    // Hand off render to custom function
    renderCustom(template, content_subdirectory, config_data_file);
    return;
  }

  let content_directory = "";

  if (content_subdirectory) {
    content_directory = `./content/${content_subdirectory}`;

  }
  else {
    content_directory = `./content/${template}`;
  }

  console.log({content_directory});

  // Load the JSON config data
  let config = await readJsonFile(`${content_directory}/config.json`);

  // make sure config has a `target` and `template`

  if (config.data) {
    // Loop through the items in config.data and process
    // any source files those items have.

    await Promise.all(config.data.map(async (item_data) => {
      // Process source files

      if (item_data.source_data) {

        item_data.source_data.map(async (source_item) => {
          console.log({ source_item });

          // read the source 
          const filename = `${content_directory}/${source_item.source}`;
          console.log({ filename });
          const markdown = await readTextFile(filename);

          // convert to html
          const html = marked.parse(markdown);

          // assign the html to the name specified as a property of config.data
          // which is a parent of `source_data`
          // console.log(`content name: ${source_item.content_name}`);
          item_data[source_item.content_name] = html;
        });

      }

    }));
  }

  // Render the template
  const template_html = await readTextFile(`./templates/${config.template}`);
  const rendered = Mustache.render(template_html, { "data": config.data });

  document.querySelector(config.target).innerHTML = rendered;

}



function attachLightboxListeners(event) {
  console.log("lightbox trigger clicked");

  const lightbox = document.querySelector('.lightbox');
  const lightbox_img = document.querySelector('#lightbox-img');
  const lightbox_caption = document.querySelector('#lightbox-caption');
  const img_src = this.querySelector('img').src;
  const caption_text = this.querySelector('figcaption').textContent;

  lightbox_img.src = img_src; // Set the lightbox image source
  lightbox_caption.textContent = caption_text; // Set the lightbox caption
  lightbox.classList.add('open'); // Show the lightbox

  // Close the lightbox when clicking on the lightbox itself (outside the image)
  lightbox.addEventListener('click', function () {
    console.log("Lightbox clicked, closing...");
    lightbox.classList.remove('open'); // Close the lightbox
  }, { once: true }); // Use { once: true } to ensure the listener is removed after one click
}


function setScrollBehavior() {
  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', function () {
      if (this.open) {
        setTimeout(() => {
          this.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 100); // Adjust the delay as needed
      }
    });
  });
}

/**
 * Adds an event listener to a parent element that handles events for dynamically generated child elements.
 * 
 * @param {Element} parent_selector - The parent element selector where the event listener will be attached.
 * @param {string} event_type - The type of event to listen for (e.g., 'click', 'mouseover').
 * @param {string} child_selector - The selector for the child elements that should trigger the event.
 * @param {Function} callback - The function to run when the event is triggered.
 */
function delegateEvent(parent_selector, event_type, child_selector, callback) {
  const parent_element = document.querySelector(parent_selector);

  if (parent_element) {
    parent_element.addEventListener(event_type, function (event) {
      // Check if the event target matches the child selector or is a descendant of it
      const target_element = event.target.closest(child_selector);
      if (target_element && parent_element.contains(target_element)) {
        callback.call(target_element, event);
      }
    });
  }
}


window.onload = async function () {
  await renderTemplate("accordion", "home/accordion");
  await renderTemplate("nav");
  console.log("Accordion rendering complete");

  // Attach lightbox event using delegateEvent
  delegateEvent('.accordion', 'click', '.lightbox-trigger', attachLightboxListeners);
  delegateEvent('.accordion', 'click', 'summary', setScrollBehavior)

}


// Call the function to load content
// loadAccordionContent();

// load accordion_config.json

// "content_directory": "mission",
// "thumbnail_image": "aagu_logo_150.png",
// "thumbnail_alt_text": "AAGU Logo Thumbnail",
// "main_image": "aagu_logo_600.png",
// "main_image_alt_text": "AAGU Logo",
// "content_file": "mission.md",
// "fig_caption_file": "aagu_logo_caption.md"

// get filename for text
// Convert text to html
// get filename for caption
// Convert to html
// Fill template
// Move h1 to summary


