export default async function() {
    console.log("Initializing accordion scrolltop as ES module...");
  
    const accordion_scrolltop = await import('./accordion-scrolltop.js');
    accordion_scrolltop.default(); 
  }