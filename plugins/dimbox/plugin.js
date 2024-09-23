export default function() {
  console.log("dimbox plugin.js");
  
  // Select all elements with class .details-figure (likely <figure> elements)
  const elements = document.querySelectorAll('.details-figure');

  elements.forEach((element, index) => {
    // Create an <a> wrapper and set its attributes
    const img = element.querySelector('img');
    const a_wrapper = document.createElement('a');
    a_wrapper.href = img.src; // Link to the image source
    a_wrapper.setAttribute('data-dimbox-type', 'image');
    a_wrapper.setAttribute('data-dimbox', index);
    
    // Optionally, include a caption if a <figcaption> is present
    const figcaption = element.querySelector('figcaption');
    if (figcaption) {
      // a_wrapper.setAttribute('data-dimbox-caption', figcaption.innerHTML);
    }

    // Insert the <a> wrapper before the <figure> element
    element.parentNode.insertBefore(a_wrapper, element);

    // Move the entire <figure> element inside the <a> wrapper
    a_wrapper.appendChild(img);
  });

  // Configure dimbox settings
  dimbox.setConfig({
    showDownloadButton: false,
    theme: 'dark'
  });

  dimbox.init();
}
