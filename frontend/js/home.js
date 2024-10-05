const quotes = [
    "Australians lost a record amount of more than $2.7 billion to scams in 2023.",
    "Have you been scammed?",
    "Seniors are often targeted by scammers due to their perceived vulnerability.",
    "Over 70% of scam victims aged 65 and older report financial losses.",
    "Australians Lost Over $3.1 Billion to Scams in 2022",
    "Senior Australians (65+) Reported Losing $120.7 Million in 2022",
    "Phishing Scams Accounted for $23.8 Million in Losses Last Year",
    "Scam Losses Increased by 80% in a Single Year",
    "Remote Access Scams Cost Australians Over $30 Million in 2022",
    "Investment Scams Caused a Staggering $1.5 Billion in Losses",
    "Phone Call Scams Resulted in $18.6 Million in Losses in 2022",
    "Fake Online Shopping Scams Scammed Australians Out of $8.6 Million",
    "Seniors Are a Prime Target for Scammers Due to Their Trusting Nature",
    "Government Impersonation Scams Are on the Rise Among Seniors"
];

let currentQuoteIndex = 0;

function changeQuote() {
    const quoteElement = document.getElementById('quote-text');
    quoteElement.classList.remove('visible'); // Hide the current quote

    setTimeout(() => {
        quoteElement.textContent = quotes[currentQuoteIndex]; // Update the text
        quoteElement.classList.add('visible'); // Show the new quote
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    }, 1000); // Delay for 1 second for smooth fading
}

// Change quote every 5 seconds (5000 ms)
setInterval(changeQuote, 5000);

function scrollToTrendingScams() {
    document.getElementById('trending-scams').scrollIntoView({ behavior: 'smooth' });
}

function scrollDown() {
    window.scrollBy({ 
        top: window.innerHeight, // Scroll down by one viewport height
        behavior: 'smooth' 
    });
}

function scrollUp() {
    window.scrollBy({ 
        top: -window.innerHeight, // Scroll up by one viewport height
        behavior: 'smooth' 
    });
}