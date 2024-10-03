async function makePrediction() {
    const feature = document.getElementById('emailContents').value;

    const response = await fetch('http://127.0.0.1:8000/email/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            features: feature,
        }),
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('result').innerHTML = `Prediction: ${data.prediction}`;
        const probabilityRegex = /\d{1,3}\.\d{1,2} ?%/; 
        const probabilityMatch = data.prediction.match(probabilityRegex);

        if (probabilityMatch) {
            const probability = probabilityMatch[0];  
            document.getElementById('probability').textContent = `How Sure We Are: ${probability}`;
        } else {
            document.getElementById('probability').textContent = ``;
        }

        if (data.prediction.includes("phishing email") || data.prediction.includes("defacement") || data.prediction.includes("malware") || data.prediction.includes("phishing")) {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#f8d7da'; // Red background
        } else {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background
        }
        
    } else {
        document.getElementById('result').textContent = `Error: ${data.detail}`;
    }
}


function updateWordCount() {
    // Get the text from the input box
    const text = document.getElementById('emailContents').value;
    
    // Count words by splitting the text on spaces, tabs, and newlines
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    // Update the word count display
    document.getElementById('wordCounter').textContent = `${wordCount}`;
  }