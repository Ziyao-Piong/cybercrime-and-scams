async function makePrediction() {
    const feature1 = document.getElementById('emailContent').value;
 
    const features = [parseFloat(feature1)];

    const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            features: features
        }),
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('result').textContent = `Prediction: ${data.prediction}`;
    } else {
        document.getElementById('result').textContent = `Error: ${data.detail}`;
    }
}