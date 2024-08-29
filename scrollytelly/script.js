// script.js
const quotes = [
    "Australians lost a record amount of more than $2.7 billion to scams in 2023.",
    "Have you been scammed?",
    "Seniors are often targeted by scammers due to their perceived vulnerability.",
    "Over 70% of scam victims aged 65 and older report financial losses.",
  ];

let currentQuoteIndex = 0;

function changeQuote() {
    const quoteElement = document.getElementById("quote-text");
    quoteElement.classList.remove("visible"); // Hide the current quote

    setTimeout(() => {
        quoteElement.textContent = quotes[currentQuoteIndex]; // Update the text
        quoteElement.classList.add("visible"); // Show the new quote
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    }, 1000); // Delay for 1 second for smooth fading
}

// Change quote every 3 seconds (3000 ms)
setInterval(changeQuote, 3000);

function scrollToTrendingScams() {
    document
        .getElementById("trending-scams")
        .scrollIntoView({ behavior: "smooth" });
}

