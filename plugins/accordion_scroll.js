export default function setScrollBehavior(event, targetElement) {
    console.log("Click event triggered on:", targetElement);

    if (targetElement.tagName === 'SUMMARY') {
        const detailsElement = targetElement.closest('details');
        // console.log('Associated <details> element:', detailsElement);

        setTimeout(() => {
            if (detailsElement && detailsElement.open) {
                // console.log('Details are open, calculating scroll position');
                
                // Calculate the top position, adjust for margin
                const topPosition = targetElement.getBoundingClientRect().top + window.scrollY - document.querySelector('nav').offsetHeight;

                // Scroll to calculated position
                window.scrollTo({
                    top: topPosition,
                    behavior: 'smooth'
                });

                console.log('Scrolled to top position:', topPosition);
            }
        }, 200); // Adjust delay if necessary
    }
}
