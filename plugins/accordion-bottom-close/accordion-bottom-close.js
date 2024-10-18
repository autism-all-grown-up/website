export default function setBottomClose() {

    const accordion_details = document.querySelectorAll('.accordion details');

    accordion_details.forEach(details => {
        const close_button = details.querySelector('.close-details');
        close_button.addEventListener('click', function (event) {
            // console.log(`bottom close in element clicked: {event}`);
            // console.log("closing details element");
            details.open = false;
            
        });
    });

}