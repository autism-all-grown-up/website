/*
let accordion_images = [
  {
    id: "mission",
    image: {
      url: "images/placeholder_600x400.svg",
      alt_text: "AAGU Logo"
    },
    thumbnail: {
      url: "images/placeholder_600x400.svg",
      alt_text: "AAGU Logo thumbnail"
    },
  {
    id: "lost-generation",
    image: "images/oregon_adults_autistic_and_or_receiving_idd_services.svg",
    thumbnail: "images/oregon_adults_autistic_and_or_receiving_idd_services.svg",
  },
  {
    id: "mission",
    image: "images/us_autism_funding_by_category_2010-2020.svg",
    thumbnail: "images/us_autism_funding_by_category_2010-2020.svg",
  },
  {
    id: "mission",
    image: "images/placeholder_600x400.svg",
    thumbnail: "images/placeholder_600x400.svg",
  },
  {
    id: "mission",
    image: "images/placeholder_600x400.svg",
    thumbnail: "images/placeholder_600x400.svg",
  },
  {
    id: "mission",
    image: "images/placeholder_600x400.svg",
    thumbnail: "images/placeholder_600x400.svg",
  }
];
*/

window.onload = function() {
  // Select all accordion items
  const accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach((item, index) => {
    // Add event listener to remove thumbnail when details are open

    // Find the thumbnail and main image in the current accordion item
    const thumbnail = item.querySelector(".accordion-summary-thumbnail");
    const mainImage = item.querySelector(".accordion-item-image");

    item.addEventListener("toggle", function() {
      if (item.open) {
        thumbnail.style.display = "none";
      } else {
        thumbnail.style.display = "block";
      }
    });
  });
};

// window.onload = function() {
//   // Select all accordion items
//   // const accordionItems = document.querySelectorAll(".accordion-item");

//   accordion_images.forEach((item, index) => {
//     console.log(`$item: ${item}`);

//     accordion_item = document.querySelector(`#${item.id}`);

// // Find the thumbnail and main image in the current accordion item
// const thumbnail = accordion_item.querySelector(".accordion-summary-thumbnail");
// const mainImage = accordion_item.querySelector(".accordion-item-image");

//     // Set the src attribute for both images using the same random seed
//     thumbnail.src = item.image;
//     mainImage.src = item.thumbnail;

//     // Add event listener to remove thumbnail when details are open
//     accordion_item.addEventListener("toggle", function() {
//       if (item.open) {
//         thumbnail.style.display = "none";
//       } else {
//         thumbnail.style.display = "block";
//       }
//     });
//   });
// };
