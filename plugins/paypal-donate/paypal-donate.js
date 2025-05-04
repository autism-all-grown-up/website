export default function initializePayPalDonateButton() {
  console.log("Initializing PayPal Donate Button...");

  // Get the donate button container
  const donateButtonContainer = document.getElementById('donate-button-container');
  if (!donateButtonContainer) {
    console.error("Donate button container not found.");
    return;
  }

  // Retrieve the hosted button ID from the data attribute
  const hostedButtonId = donateButtonContainer.getAttribute('data-hosted-button-id');
  if (!hostedButtonId) {
    console.error("Hosted button ID not found in the donate button container.");
    return;
  }

  // Ensure the PayPal SDK script is loaded
  const scriptId = 'paypal-donate-sdk';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js';
    script.charset = 'UTF-8';
    script.onload = () => renderDonateButton(hostedButtonId);
    document.head.appendChild(script);
  } else {
    renderDonateButton(hostedButtonId);
  }

  function renderDonateButton(buttonId) {
    if (typeof PayPal !== 'undefined' && PayPal.Donation) {
      PayPal.Donation.Button({
        env: 'production',
        hosted_button_id: buttonId,
        image: {
          src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif',
          alt: 'Donate with PayPal button',
          title: 'PayPal - The safer, easier way to pay online!',
        },
      }).render('#donate-button');
    } else {
      console.error("PayPal SDK failed to load or is unavailable.");
    }
  }
}