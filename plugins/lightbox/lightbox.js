export default function attachLightboxToFigure() {
    console.log("Lightbox plugin initialized");

    // Ensure the lightbox is already in the DOM (create it if not)
    let lightbox = document.querySelector('.lightbox');
    
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        lightbox.innerHTML = `
        <div class="lightbox-content">
            <div class="lightbox-header">
                <img class="lightbox-btn lightbox-close" src="icons/fa-xmark-solid.svg" alt="Close" />
                <img class="lightbox-btn lightbox-expand" src="icons/fa-expand-solid.svg" alt="Fullscreen" />
                <img class="lightbox-btn lightbox-contract" src="icons/fa-compress-solid.svg" alt="Exit Fullscreen" style="display: none;" />
            </div>
            <div class="lightbox-body"></div>
        </div>`;
        document.body.appendChild(lightbox);
        // console.log("Lightbox structure added to DOM");
    }

    // Select all <figure> elements with the class .details-figure
    const figures = document.querySelectorAll('.details-figure');

    figures.forEach((figure) => {
        const img = figure.querySelector('img');
        img.addEventListener('click', () => {
            // console.log("Lightbox for figure triggered");

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
            const expandButton = lightbox.querySelector('.lightbox-expand');
            const contractButton = lightbox.querySelector('.lightbox-contract');

            closeButton.addEventListener('click', () => {
                lightbox.classList.remove('open');
                // Exit fullscreen mode if still active
                if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) { /* Safari */
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) { /* IE11 */
                        document.msExitFullscreen();
                    }
                }
            });

            // Enter fullscreen mode
            expandButton.addEventListener('click', () => {
                if (lightbox.requestFullscreen) {
                    lightbox.requestFullscreen();
                } else if (lightbox.webkitRequestFullscreen) { /* Safari */
                    lightbox.webkitRequestFullscreen();
                } else if (lightbox.msRequestFullscreen) { /* IE11 */
                    lightbox.msRequestFullscreen();
                }
                // Hide the expand button, show the contract button
                expandButton.style.display = 'none';
                contractButton.style.display = 'inline';
            });

            // Exit fullscreen mode
            contractButton.addEventListener('click', () => {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
                // Hide the contract button, show the expand button
                contractButton.style.display = 'none';
                expandButton.style.display = 'inline';
            });
        });
    });
}
