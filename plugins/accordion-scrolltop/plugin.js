export default async function() {
    console.log("Initializing accordion scrolltop as ES module...");
  
    // Load the lightbox module dynamically
    const accordion_scrolltop = await import('./accordion-scrolltop.js');
    accordion_scrolltop.default(); // Run the lightbox logic
  }