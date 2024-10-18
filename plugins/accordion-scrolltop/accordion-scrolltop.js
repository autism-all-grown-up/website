export default function setScrollBehavior() {

    const accordion_details = document.querySelectorAll('.accordion details');

    accordion_details.forEach(details => {
        const summary = details.querySelector('summary');
        summary.addEventListener('click', function (event) {
            // console.log(`summary element clicked: {event}`);

            setTimeout(() => {
                if (details && details.open) {
                    // console.log('Details are open, calculating scroll position');

                    // Calculate the top position, adjust for margin
                    const topPosition = summary.getBoundingClientRect().top + window.scrollY - document.querySelector('nav').offsetHeight;

                    // Scroll to calculated position
                    window.scrollTo({
                        top: topPosition,
                        behavior: 'smooth'
                    });

                    // console.log('Scrolled to top position:', topPosition);
                }
            }, 200); // Adjust delay if necessary
            
        });
    });

}
