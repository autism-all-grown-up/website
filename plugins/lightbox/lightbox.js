export default function attachLightboxToFigure() {
    console.log("Lightbox plugin initialized");

    // Ensure the lightbox is already in the DOM (create it if not)
    let lightbox = document.querySelector('.lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <div class="lightbox-close">&times;</div>
                <div class="lightbox-body"></div>
            </div>`;
        document.body.appendChild(lightbox);
        console.log("Lightbox structure added to DOM");
    }

    // Select all <figure> elements with the class .details-figure
    const figures = document.querySelectorAll('.details-figure');

    figures.forEach((figure) => {
        const img = figure.querySelector('img');
        img.addEventListener('click', () => {
            console.log("Lightbox for figure triggered");
            
            const lightboxBody = lightbox.querySelector('.lightbox-body');

            // Add the figure content to the modal body
            lightboxBody.innerHTML = ''; // Clear any existing content
            lightboxBody.appendChild(figure.cloneNode(true)); // Clone and add the figure

            // Show the lightbox modal
            lightbox.classList.add('open');

            // Enable scrolling inside the modal
            lightboxBody.style.overflowY = 'auto';
            lightboxBody.style.maxHeight = '80vh'; // Limit height to allow scrolling

            // Close the lightbox when clicking on the close button
            const closeButton = lightbox.querySelector('.lightbox-close');
            closeButton.addEventListener('click', () => {
                lightbox.classList.remove('open');
            });

            // Handle fullscreen mode for the modal
            if (lightbox.requestFullscreen) {
                lightbox.requestFullscreen();
            } else if (lightbox.webkitRequestFullscreen) { /* Safari */
                lightbox.webkitRequestFullscreen();
            } else if (lightbox.msRequestFullscreen) { /* IE11 */
                lightbox.msRequestFullscreen();
            }
        });
    });
}
