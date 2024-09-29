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
            document.getElementById('probability').textContent = `Probability not found in prediction.`;
        }

        if (data.prediction.includes("phishing email")) {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#f8d7da'; // Red background
        } else if (data.prediction.includes("safe email")) {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background
        } else {
            document.getElementById('predictionResultWrapper').style.backgroundColor = ' #cce5ff';
        }
        
    } else {
        document.getElementById('result').textContent = `Error: ${data.detail}`;
    }
}