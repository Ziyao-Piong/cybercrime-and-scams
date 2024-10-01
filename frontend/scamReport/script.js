document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('scamReportForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate email fields
        if (data.userEmail !== data.verifyEmail) {
            alert('Email addresses do not match. Please check and try again.');
            return;
        }

        // Convert date to the first day of the month
        const scamDate = new Date(data.scamDate);
        data.StartOfMonth = new Date(scamDate.getFullYear(), scamDate.getMonth(), 1).toISOString().split('T')[0];

        // Remove the original scamDate field
        delete data.scamDate;

        // Rename fields to match backend expectations
        data.Address_State = data.addressState;
        data.Scam_Contact_Mode = data.contactMode;
        data.Complainant_Age = data.age;
        data.Complainant_Gender = data.gender;
        data.Category_Level_2 = data.categoryLevel2;
        data.Category_Level_3 = data.categoryLevel3;
        data.Amount_lost = parseFloat(data.amountLost);
        data.Number_of_reports = 1;

        // Ensure we correctly rename user_email and verify_email fields
        data.user_email = data.userEmail; 
        data.verify_email = data.verifyEmail; 

        // Remove renamed fields from the object since we have renamed them
        delete data.addressState;
        delete data.contactMode;
        delete data.age;
        delete data.gender;
        delete data.categoryLevel2;
        delete data.categoryLevel3;
        delete data.amountLost;
        delete data.userEmail;  // Remove the original userEmail
        delete data.verifyEmail;  // Remove the original verifyEmail

        console.log('Submitting data:', data);

        fetch('http://127.0.0.1:8000/submit_report', {
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
                form.reset();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}. Please check the form and try again.`);
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
