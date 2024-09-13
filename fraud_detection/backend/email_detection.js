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
        document.getElementById('result').textContent = `Prediction: ${data.prediction}`;
    } else {
        document.getElementById('result').textContent = `Error: ${data.detail}`;
    }
}