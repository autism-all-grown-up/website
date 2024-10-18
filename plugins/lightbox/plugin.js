// export default async function() {
//   console.log("Initializing lightbox plugin...");

//   // Load the lightbox plugin
//   const { default: initLightbox } = await import('./lightbox.js');

//   // Run the lightbox initialization (which does all the actual work)
//   initLightbox();
// }


export default async function() {
  // console.log("Initializing lightbox as ES module...");

  // Load the lightbox module dynamically
  const lightboxModule = await import('./lightbox.js');
  lightboxModule.default(); // Run the lightbox logic
}


// export default function() {
//   console.log("Initializing dimbox as non-module...");

//   // Dynamically load the non-module script (e.g., dimbox.min.js)
//   const script = document.createElement('script');
//   script.src = './dimbox.min.js';
//   script.async = true;
//   script.onload = () => console.log('dimbox.min.js loaded successfully.');
//   script.onerror = () => console.error('Failed to load dimbox.min.js');
  
//   document.body.appendChild(script);
// }
