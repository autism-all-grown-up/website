// Get the current page URL
var currentUrl = window.location.href;

// Get the referrer (the URL of the previous page)
var referrer = document.referrer;

// Check if the referrer is empty or from a search engine (indicative of organic visit)
if (!referrer || referrer === "") {
    console.log("This is likely a direct or organic visit.");
} else {
    // Parse the referrer to get its domain
    var referrerDomain = (new URL(referrer)).hostname;
    var currentDomain = window.location.hostname;

    // Check if the visit is from the same domain
    if (referrerDomain === currentDomain) {
        console.log("This is an internal visit (from another page on the same website).");
    } else {
        console.log("This is likely a referral from another site.");
    }
}
