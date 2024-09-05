export default function handleDynamicLinks(event, targetElement) {
    // Attach the event listener to the document (or a parent element)
    document.addEventListener('click', function (event) {
        // Check if the clicked element is a .dynamic-link
        if (event.target.matches('.dynamic-link')) {
            event.preventDefault(); // Prevent default link behavior (full page reload)
            event.stopImmediatePropagation(); // Stop further event propagation

            const page = event.target.getAttribute('href').replace(/^\?/, ''); // Get the URL, removing the leading "/"
            // alert(page);
            
            // console.log({ page });

            // const new_url = `${window.location.origin}/${page}`;
            // console.log({ new_url });

            // // Update the URL in the browser without reloading the page
            // history.pushState({ page: page }, '', new_url);

            // Load the new content into <main>
            // Call your existing render function to dynamically load the page content
            // renderPage(page); // Uncomment to use your actual render function
        }
    });
}

// Handle browser back/forward navigation with the History API
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.page) {
        // Load content for the page stored in the history state
        renderPage(event.state.page);
    }
});

/*
{
    "path": "dynamic_links",
    "event": "click",
    "target": "body",
    "callback": "handleDynamicLinks"
}
*/