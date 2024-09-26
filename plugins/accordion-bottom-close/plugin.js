export default async function() {
    console.log("Initializing accordion bottom close plugin");
  
    const accordion_bottom_close = await import('./accordion-bottom-close.js');
    accordion_bottom_close.default();
  }