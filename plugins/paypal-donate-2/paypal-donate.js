export default function initializePayPalDonateButton() {
  console.log("Initializing PayPal Donate Button...");

  let selectedAmount = '10.00';
  let frequency = 'one-time';

  // Handle amount selection
  const amountButtons = document.querySelectorAll('.donation-button');
  amountButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      amountButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (this.id === 'otherAmountBtn') {
        document.getElementById('customAmountInput').style.display = 'block';
        selectedAmount = '';
      } else {
        document.getElementById('customAmountInput').style.display = 'none';
        selectedAmount = this.dataset.amount;
      }
    });
  });

  // Handle frequency toggle
  const freqButtons = {
    oneTime: document.getElementById('oneTime'),
    monthly: document.getElementById('monthly'),
    yearly: document.getElementById('yearly'),
  };
  Object.entries(freqButtons).forEach(([key, btn]) => {
    btn.addEventListener('click', () => {
      Object.values(freqButtons).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      frequency = key;
      renderPayPalButton();
    });
  });

  function getFinalAmount() {
    if (selectedAmount) return selectedAmount;
    const custom = document.getElementById('customAmountInput').value;
    if (!custom || isNaN(custom) || parseFloat(custom) <= 0) {
      alert("Please enter a valid donation amount.");
      return null;
    }
    return parseFloat(custom).toFixed(2);
  }

  function loadPayPalSDK(callback) {
    const scriptId = 'paypal-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID_HERE&currency=USD';
      script.onload = callback;
      script.onerror = () => console.error("Failed to load PayPal SDK.");
      document.head.appendChild(script);
    } else {
      callback();
    }
  }

  function renderPayPalButton() {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) {
      console.error("PayPal button container not found.");
      return;
    }

    paypalButtonContainer.innerHTML = '';
    if (typeof paypal === 'undefined') {
      console.error("PayPal SDK is not loaded.");
      return;
    }

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'donate'
      },
      createOrder: function (data, actions) {
        const amount = getFinalAmount();
        if (!amount) throw new Error("Invalid amount");

        if (frequency === 'one-time') {
          return actions.order.create({
            purchase_units: [{
              amount: { value: amount },
              description: "One-Time Donation to Autism All Grown Up"
            }]
          });
        } else {
          const cycle = frequency === 'monthly' ? 'MONTH' : 'YEAR';
          return actions.subscription.create({
            plan_id: 'REPLACE_WITH_A_PLAN_ID'
          });
        }
      },
      onApprove: function (data, actions) {
        alert('Thank you for your donation!');
      }
    }).render('#paypal-button-container');
  }

  // Load the PayPal SDK and render the button
  loadPayPalSDK(renderPayPalButton);
}