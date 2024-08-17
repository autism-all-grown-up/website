
function getRandomImageURL(seed) {
  return "https://loremflickr.com/600/400/cat?random=" + seed;
}

window.onload = function() {
  // Select all accordion items
  const accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach((item, index) => {
    // Generate a unique seed for each item
    const randomSeed = Math.random() + index;

    // Find the thumbnail and main image in the current accordion item
    const thumbnail = item.querySelector(".accordion-summary-thumbnail");
    const mainImage = item.querySelector(".accordion-item-image");

    // Set the src attribute for both images using the same random seed
    thumbnail.src = getRandomImageURL(randomSeed);
    mainImage.src = getRandomImageURL(randomSeed);

    // Add event listener to remove thumbnail when details are open
    item.addEventListener("toggle", function() {
      if (item.open) {
        thumbnail.style.display = "none";
      } else {
        thumbnail.style.display = "block";
      }
    });
  });
};
