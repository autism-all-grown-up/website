async function readJsonFile(file_path) {
  // console.log(`file_path: ${file_path}`);

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

async function readMarkdownFileToHTML(file_path) {
  // console.log(`file_path: ${file_path}`);

  try {
    const response = await fetch(file_path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file_path}: ${response.status} ${response.statusText}`);
    }
    const markdown = await response.text();
    // console.log(markdown);
    const html = marked.parse(markdown);
    // console.log(html);
    return html;
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return null;
  }
}


window.onload = async function () {
  const accordion_content_dir = "./content/home/accordion";
  // console.log(`accordion_content_dir: ${accordion_content_dir}`);
  
  // Await the JSON data
  let accordion_data = await readJsonFile(`${accordion_content_dir}/accordion_config.json`);
  // console.log(`accordion_data:`, accordion_data);

  if (accordion_data) {
    // Await the markdown content
    for (const item of accordion_data) {
      // console.log(`path:${accordion_content_dir}/${item.content_directory}`);
      item.main_text = await readMarkdownFileToHTML(`${accordion_content_dir}/${item.content_directory}/${item.content_file}`);
      item.fig_caption_text = await readMarkdownFileToHTML(`${accordion_content_dir}/${item.content_directory}/${item.fig_caption_file}`);
      item.thumbnail_image = `images/${item.thumbnail_image}`;
      item.main_image = `images/${item.main_image}`;
    }

    // console.dir(`accordion_data: ${JSON.stringify(accordion_data)}`);

    // Render the accordion
    const template = document.querySelector('#accordion-template').innerHTML;
    // console.log(template);

    const rendered = Mustache.render(template, { homepage_accordions: accordion_data });
    // console.log(rendered);

    document.querySelector('.accordion').innerHTML = rendered;
  }
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
