export default function setBottomClose() {

    const accordion_details = document.querySelectorAll('.accordion details');

    accordion_details.forEach(details => {
        const close_button = details.querySelector('.close-details');
        close_button.addEventListener('click', function (event) {
            console.log(`element clicked: {event}`);

            details.open = false;
            
        });
    });

}