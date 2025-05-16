export default async function() {
  console.log("Initializing PayPal Donate Plugin...");
  const paypalDonateModule = await import('./paypal-donate.js');
  paypalDonateModule.default(); // Initialize the PayPal donate button logic
}