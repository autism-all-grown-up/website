export default function attachLightboxListeners(event, targetElement) {
    console.log({ targetElement });

    console.log("Lightbox trigger clicked");

    const element_clicked = event.target;
    if (event.target.nodeName != "IMG")
    {
        return;
    }

    const lightbox = document.querySelector('.lightbox');
    const lightbox_img = document.querySelector('#lightbox-img');
    const lightbox_caption = document.querySelector('#lightbox-caption');
    const img = targetElement.querySelector('img');
    const img_src = img ? img.src : '';
    const caption = targetElement.querySelector('figcaption');
    const caption_text = caption ? caption.innerHTML : '';

    lightbox_img.src = img_src; // Set the lightbox image source
    lightbox_caption.innerHTML = caption_text; // Set the lightbox caption
    lightbox.classList.add('open'); // Show the lightbox

    // Attempt to enter fullscreen mode
    if (lightbox.requestFullscreen) {
        lightbox.requestFullscreen();
    } else if (lightbox.webkitRequestFullscreen) { /* Safari */
        lightbox.webkitRequestFullscreen();
    } else if (lightbox.msRequestFullscreen) { /* IE11 */
        lightbox.msRequestFullscreen();
    }

    // Close the lightbox when clicking on the lightbox itself (outside the image)
    lightbox_img.addEventListener(
        'click',
        function () {
            // console.log("Lightbox clicked, closing...");
            lightbox.classList.remove('open'); // Close the lightbox

            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.webkitFullscreenElement) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msFullscreenElement) { /* IE11 */
                document.msExitFullscreen();
            }
        },
        { once: true }
    ); // Use { once: true } to ensure the listener is removed after one click
}

// document.addEventListener("DOMContentLoaded", () => {
//     const lightbox = document.querySelector('.lightbox');
//     const lightbox_img = document.querySelector('#lightbox-img');
//     const lightbox_caption = document.querySelector('#lightbox-caption');

//     const figures = document.querySelectorAll('.details-figure');

//     figures.forEach(figure => {
//         figure.addEventListener('click', (e) => {
//             const img = figure.querySelector('img');
//             const img_src = img ? img.src : '';
//             const caption = figure.querySelector('figcaption');
//             const caption_text = caption ? caption.innerHTML : '';

//             lightbox_img.src = img_src;
//             lightbox_caption.innerHTML = caption_text;

//             // Show the lightbox
//             lightbox.classList.add('open');

//             // Attempt to enter fullscreen mode
//             if (lightbox.requestFullscreen) {
//                 lightbox.requestFullscreen();
//             } else if (lightbox.webkitRequestFullscreen) { /* Safari */
//                 lightbox.webkitRequestFullscreen();
//             } else if (lightbox.msRequestFullscreen) { /* IE11 */
//                 lightbox.msRequestFullscreen();
//             }
//         });
//     });

//     // Close the lightbox and exit fullscreen mode
//     lightbox.addEventListener('click', function () {
//         lightbox.classList.remove('open');

//         if (document.fullscreenElement) {
//             document.exitFullscreen();
//         } else if (document.webkitFullscreenElement) { /* Safari */
//             document.webkitExitFullscreen();
//         } else if (document.msFullscreenElement) { /* IE11 */
//             document.msExitFullscreen();
//         }
//     });
// });
