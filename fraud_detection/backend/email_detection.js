async function makePrediction() {
    const feature = document.getElementById('emailContents').value;

    const response = await fetch('https://www.seniorsafe.info/api/email/predict', {
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

        // Regular expression to extract confidence percentage
        const probabilityRegex = /\d{1,3}\.\d{1,2} ?%/; 
        const probabilityMatch = data.prediction.match(probabilityRegex);

        // Default to unknown email type
        let emailType = "Unknown";

        // Determine the type of email
        if (data.prediction.includes("phishing")) {
            emailType = "Phishing Email";
        } else if (data.prediction.includes("defacement")) {
            emailType = "Defacement Email";
        } else if (data.prediction.includes("malware")) {
            emailType = "Malware Email";
        } else if (data.prediction.includes("safe")) {
            emailType = "Safe Email";
        }

        // Confidence handling for various cases
        if (probabilityMatch) {
            const probability = probabilityMatch[0];  
            document.getElementById('probability').textContent = `We are ${probability} confident this is a ${emailType}.`;
        } else {
            if (emailType === "Safe Email") {
                document.getElementById('probability').textContent = `This email appears to be safe, but confidence could not be determined.`;
            } else if (emailType === "Unknown") {
                document.getElementById('probability').textContent = `We are unsure about this email. It doesn't match any known malicious types.`;
            } else {
                document.getElementById('probability').textContent = `Confidence could not be determined, but this appears to be a ${emailType}.`;
            }
        }

        // Change background color based on email type
        if (emailType === "Phishing Email" || emailType === "Defacement Email" || emailType === "Malware Email") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#f8d7da'; // Red background for malicious
        } else if (emailType === "Safe Email") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background for safe
        } else {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#fff3cd'; // Yellow background for unknown
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
