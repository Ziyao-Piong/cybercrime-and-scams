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
        let urlType = "Unknown";

        // Determine the type of email
        if (data.prediction.includes("phishing email")) {
            emailType = "Phishing Email";
        } else if (data.prediction.includes("safe email")) {
            emailType = "Safe Email";
        } 
        
        
        if (data.prediction.includes("defacement")) {
            urlType = "Malicous";
        } else if (data.prediction.includes("malware")) {
            urlType = "Malicous";
        } else if (data.prediction.includes(": phishing")) {
            urlType = "Malicous";
        } else if (data.prediction.includes(": safe")) {
            urlType = "Safe";
        } 

        // Confidence handling for various cases
        if (probabilityMatch && urlType == "Unknown") {
            const probability = probabilityMatch[0];  
            document.getElementById('probability').textContent = `We are ${probability} confident this is a ${emailType}.`;
        } else if (probabilityMatch && urlType != "Unknown") {
            const probability = probabilityMatch[0];  
            document.getElementById('probability').textContent = `We are ${probability} confident that the email content is ${emailType}. The URL detected is ${urlType}`;
        }else {
            if (urlType === "Safe") {
                document.getElementById('probability').textContent = `The URL detected seems to be safe, but confidence could not be determined.`;
            } else if (urlType === "Unknown") {
                document.getElementById('probability').textContent = `We are unsure about this email. It doesn't match any known malicious types.`;
            } else {
                document.getElementById('probability').textContent = `Confidence could not be determined, but there are at least 1 malicious URL detected.`;
            }
        }

        // Change background color based on email type
        if (emailType === "Phishing Email" || urlType == "Malicous") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#f8d7da'; // Red background for malicious
        } else if (emailType === "Safe Email" && urlType == "Safe") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background for safe
        } else if (emailType === "Safe Email" && urlType == "Unknown") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background for safe
        } else if (emailType === "Unknown" && urlType == "Safe") {
            document.getElementById('predictionResultWrapper').style.backgroundColor = '#d4edda'; // Green background for safe
        }else {
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
