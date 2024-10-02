document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('scamReportForm');
    const scamDateInput = document.getElementById('scamDate'); // Get the scam date input field
    const loadingMessage = document.getElementById('loading');  // Reference the loading message element

    // Dynamically set the max date for the scamDate input to today's date
    const today = new Date().toISOString().split('T')[0];
    scamDateInput.setAttribute('max', today);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Show the loading message
        loadingMessage.style.display = 'block';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate email fields
        if (data.user_email !== data.verify_email) {
            alert('Email addresses do not match. Please check and try again.');
            loadingMessage.style.display = 'none';  // Hide loading message if validation fails
            return;
        }

        // Validate that a date is provided and is valid
        if (!data.StartOfMonth || isNaN(new Date(data.StartOfMonth).getTime())) {
            alert('Please enter a valid date.');
            loadingMessage.style.display = 'none';  // Hide loading message if validation fails
            return;
        }

        // Convert date to the first day of the month
        const scamDate = new Date(data.StartOfMonth);
        data.StartOfMonth = new Date(scamDate.getFullYear(), scamDate.getMonth(), 1).toISOString().split('T')[0];

        // Convert amount lost to float
        data.Amount_lost = parseFloat(data.Amount_lost);

        // Add a fixed number of reports
        data.Number_of_reports = 1;

        console.log('Submitting data:', data);

        fetch('http://127.0.0.1:8000/data/api/submit_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(JSON.stringify(err.detail));
                });
            }
            return response.json();
        })
        .then((responseData) => {
            alert(`Report submitted successfully! Your receipt number is: ${responseData.receipt_number}`);
            form.reset();  // Reset the form after successful submission
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}. Please check the form and try again.`);
        })
        .finally(() => {
            // Hide the loading message once the response is received
            loadingMessage.style.display = 'none';
        });
    });
});

function countWords(textarea) {
    const text = textarea.value;
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    const wordCountDisplay = document.getElementById('wordCount');

    if (wordCount > 500) {
        textarea.value = words.slice(0, 500).join(' ');
        wordCountDisplay.textContent = '500/500 words';
    } else {
        wordCountDisplay.textContent = `${wordCount}/500 words`;
    }
}
