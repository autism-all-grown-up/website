export default function attachLightboxListeners(event, targetElement) {
    console.log("Lightbox trigger clicked");

    const lightbox = document.querySelector('.lightbox');
    const lightbox_img = document.querySelector('#lightbox-img');
    const lightbox_caption = document.querySelector('#lightbox-caption');
    const img = targetElement.querySelector('img');
    const img_src = img ? img.src : '';
    const caption = targetElement.querySelector('figcaption');
    const caption_text = caption ? caption.textContent : '';

    lightbox_img.src = img_src; // Set the lightbox image source
    lightbox_caption.textContent = caption_text; // Set the lightbox caption
    lightbox.classList.add('open'); // Show the lightbox

    // Close the lightbox when clicking on the lightbox itself (outside the image)
    lightbox.addEventListener(
        'click',
        function () {
            // console.log("Lightbox clicked, closing...");
            lightbox.classList.remove('open'); // Close the lightbox
        },
        { once: true }
    ); // Use { once: true } to ensure the listener is removed after one click
}
