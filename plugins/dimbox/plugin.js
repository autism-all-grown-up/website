// Example of how plugin wrappers should now bind events directly
export default function(evt, parent) {
  const elements = [...document.querySelectorAll(`${parent} .lightbox`)];
  elements.forEach((element, index) => {
    const img = element.querySelector('img');
    const figcaption = element.querySelector('figcaption');
    
    const a_wrapper = document.createElement('a');
    a_wrapper.href = img.src;
    a_wrapper.setAttribute('data-dimbox-type', 'image');
    a_wrapper.setAttribute('data-dimbox', index);
    if (figcaption) {
      a_wrapper.setAttribute('data-dimbox-caption', figcaption.innerHTML);
    }

    element.parentNode.insertBefore(a_wrapper, element);
    a_wrapper.appendChild(element);
  });

  dimbox.setConfig({
    showDownloadButton: true,
    theme: 'dark'
  });
}
