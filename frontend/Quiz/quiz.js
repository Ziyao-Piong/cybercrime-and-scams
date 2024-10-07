document.addEventListener('DOMContentLoaded', (event) => {
    let currentQuestion = 0;
    let score = 0;
    let questions = [];
    let userAnswers = []; // To store user answers
    let scamTypePerformance = {};

    const quizSection = document.querySelector('.quiz-section');
    const progressBar = document.querySelector('.progress-bar');
    const answerButtons = document.querySelectorAll('.btn-answer');
    const backButton = document.querySelector('.btn-back'); // New back button reference
    let questionTitle = document.createElement('h2');
    let questionText = document.createElement('p');

    async function fetchQuestions() {
        try {
            const response = await fetch('https://www.seniorsafe.info/api/data/api/quiz-questions');
            questions = await response.json();
            startQuiz();
        } catch (error) {
            console.error('Error fetching questions:', error);
            quizSection.innerHTML = '<p>Error loading quiz. Please try again later.</p>';
        }
    }

    function startQuiz() {
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
        scamTypePerformance = {};
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestion];
        if (!scamTypePerformance[question["TypeOfEmail"]]) {
            scamTypePerformance[question["TypeOfEmail"]] = { correct: 0, total: 0 };
        }

        questionTitle.textContent = `Q${currentQuestion + 1}. Is this a phishing email?`;
        questionText.textContent = question.content;

        const questionContainer = document.getElementById('question-container');
        questionContainer.innerHTML = '';
        questionContainer.appendChild(questionTitle);
        questionContainer.appendChild(questionText);

        updateProgressBar();
        backButton.style.display = currentQuestion > 0 ? 'inline-block' : 'none';
    }

    function updateProgressBar() {
        const progress = (currentQuestion / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }

    function handleAnswer(isPhishing) {
        const question = questions[currentQuestion];
        const isCorrect = (isPhishing && question.is_phishing) || (!isPhishing && !question.is_phishing);

        if (isCorrect) {
            score++;
        }

        userAnswers[currentQuestion] = { isCorrect, isPhishing };

        scamTypePerformance[question["TypeOfEmail"]].total++;
        if (isCorrect) {
            scamTypePerformance[question["TypeOfEmail"]].correct++;
        }

        showFeedback(isCorrect);
    }

    function showFeedback(isCorrect) {
        const question = questions[currentQuestion];
        answerButtons.forEach(button => {
            button.disabled = true;
            if (button.textContent === 'YES' && question.is_phishing) {
                button.classList.add(isCorrect ? 'btn-success' : 'btn-danger');
            } else if (button.textContent === 'NO' && !question.is_phishing) {
                button.classList.add(isCorrect ? 'btn-success' : 'btn-danger');
            }
        });

        const feedbackElement = document.createElement('div');
        feedbackElement.classList.add('feedback-element', 'mt-3', 'p-3', 'border', 'rounded');
        feedbackElement.style.backgroundColor = isCorrect ? 'lightgreen' : 'lightcoral';
        feedbackElement.innerHTML = `
            <h4>This is a ${question["TypeOfEmail"]}</h4>
            <p><strong>Reason:</strong> ${question.reason}</p>
            <p><strong>Recommendation:</strong> ${question.recommendation}</p>
        `;
        quizSection.appendChild(feedbackElement);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.classList.add('btn', 'btn-primary', 'mr-2', 'btn-yes');
        nextButton.addEventListener('click', () => {
            quizSection.removeChild(feedbackElement);
            nextButton.remove(); 

            answerButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove('btn-success', 'btn-danger');
            });
            currentQuestion++;
            showQuestion();
        });

        const nextButtonPlaceholder = document.querySelector('.next-button-placeholder');
        nextButtonPlaceholder.innerHTML = '';
        nextButtonPlaceholder.appendChild(nextButton);
    }

    function handleBack() {
        currentQuestion--; // Go back one question
        const previousAnswer = userAnswers[currentQuestion]; // Retrieve the previous answer

        // Update score if necessary
        if (previousAnswer && previousAnswer.isCorrect) {
            score--;
        }

        // Update scamTypePerformance
        const question = questions[currentQuestion];
        scamTypePerformance[question["TypeOfEmail"]].total--;
        if (previousAnswer && previousAnswer.isCorrect) {
            scamTypePerformance[question["TypeOfEmail"]].correct--;
        }

        showQuestion();
    }

    function showResults() {
        const percentage = (score / questions.length) * 100;
        let feedback = '';
        let incorrectScams = [];
        let correctScams = []; // Array to store categories where all questions were answered correctly
        let scamFeedback = ''; // Initialize scamFeedback as an empty string
    
        const scamLinks = {
            "Business Email Compromise Phishing Scam": "../businessEmailCompromisePhishing.html",
            "Clone Phishing Scam": "../clonePhishing.html",
            "Popup Phishing Scam": "../popupPhishing.html",
            "Search Engine Phishing Scam": "../searchEnginePhishing.html",
            "Smishing Phishing Scam": "../smishingPhishing.html",
            "Spear Phishing Scam": "../spearPhishing.html",
            "Voice Phishing Scam": "../voicePhishing.html"
        };
    
        // Only generate scam feedback if the score is less than 100%
        if (percentage < 100) {
            scamFeedback = '<h3>Areas we think you need to improve:</h3><ul>';
    
            // Iterate over the performance data to generate personalized feedback for each scam type
            for (const [scamType, performance] of Object.entries(scamTypePerformance)) {
                if (performance.correct === performance.total) {
                    // If the user got all questions right in this category, add to correctScams array
                    correctScams.push(scamType);
                } else if (performance.correct > 0) {
                    // If the user got some questions right but not all

                    if (scamType === "Safe Email") {
                        scamFeedback += `
                            <li><strong>${scamType}</strong>: You answered ${performance.correct} out of ${performance.total} questions correctly. 
                            Consider reviewing more on Safe Emails and Trending Scams to improve.</li>
                        `;
                    } else {
                        scamFeedback += `
                            <li><strong>${scamType}</strong>: You answered ${performance.correct} out of ${performance.total} questions correctly. 
                            Consider reviewing more on <a href="${scamLinks[scamType]}" target="_blank">${scamType}</a> to improve.</li>
                        `;
                    }
                    incorrectScams.push(scamType);

                    // scamFeedback += `
                    //     <li><strong>${scamType}</strong>: You answered ${performance.correct} out of ${performance.total} questions correctly. 
                    //     Consider reviewing more on <a href="${scamLinks[scamType]}" target="_blank">${scamType}</a> to improve.</li>
                    // `;
                    // incorrectScams.push(scamType);  // Track incorrect scam types
                } else {
                    // If the user got no questions right in this category
                    if (scamType === "Safe Email") {
                        scamFeedback += `
                            <li><strong>${scamType}</strong>: You didn't answer any questions correctly. 
                            We recommend revisiting Safe Emails and Trending Scams to strengthen your understanding.</li>
                        `;
                    } else {
                    
                        scamFeedback += `
                            <li><strong>${scamType}</strong>: You didn't answer any questions correctly. We recommend revisiting 
                            <a href="${scamLinks[scamType]}" target="_blank">${scamType}</a> to strengthen your understanding.</li>
                        `;
                    }
                    incorrectScams.push(scamType);  // Track incorrect scam types
                }
            }
            scamFeedback += '</ul>';
        }
    
        // Handle feedback for categories where all questions were answered correctly
        if (correctScams.length > 0) {
            const correctScamList = correctScams.join(', ');
            scamFeedback = `<p>You answered all questions correctly in the following categories: <strong>${correctScamList}</strong>. Keep up the vigilance.</p>` + scamFeedback;
        }
    
        // General feedback based on overall performance
        if (percentage === 100) {
            feedback = `Excellent Work! You correctly identified every phishing scam! You're well-equipped to spot phishing attempts. Learn how scammers are currently targeting senior Australians by reading more about <a href="../../scrollytelly/data.html">Trending Scams</a> in Australia.`;
        } else if (percentage >= 80) {
            feedback = "Great work! You correctly identified most phishing scams. You're well-equipped to spot phishing attempts, but still need to improve.";
        } else if (percentage >= 50) {
            feedback = "Good job! You identified half or more of the phishing scams correctly, but there's room for improvement.";
        } else {
            feedback = "It seems phishing scams can be tricky for you to identify. Make sure to review the following topics to improve your scam-spotting skills.";
        }
    
        // Additional feedback for categories that need improvement
        //if (incorrectScams.length > 0) {
        //    const incorrectScamList = incorrectScams.join(', ');
        //    feedback += ` We think you need to look into the following types of scams: ${incorrectScamList}.`;
        //}
    
        // Display the results and feedback
        quizSection.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your score: ${score} out of ${questions.length} (${percentage.toFixed(2)}%)</p>
            <p>${feedback}</p>
            ${scamFeedback}  <!-- This will display the scam feedback for correctly/incorrectly answered categories -->
            <button class="btn btn-primary mt-3" onclick="location.reload()">Try Again</button>
        `;
    
    
        const ctx = document.getElementById('resultsChart').getContext('2d');
        const resultsChart = new Chart(ctx, {
    type: 'bar', 
    data: {
        labels: Object.keys(scamTypePerformance), // Categories of scam types
        datasets: [{
            label: 'Correct Answers',
            data: Object.values(scamTypePerformance).map(perf => perf.correct),
            backgroundColor: Object.values(scamTypePerformance).map(perf => {
                if (perf.correct === 2) return 'rgba(50,205,50, 0.7)';  // Green for score of 2
                if (perf.correct === 1) return 'rgba(255, 206, 86, 0.7)';  // Yellow for score of 1
                return 'rgba(201, 203, 207, 0.7)';  // Default color for others
            })
        }]
    },
    options: {
        indexAxis: 'y',  // This makes the bar chart horizontal
        scales: {
            x: {  // This is now the value axis
                stacked: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,  // Set step size to 1 to avoid decimal increments
                    max: 2,       // Set max value to 2 to limit the scale
                    precision: 0  // Ensures no decimals are shown
                },
                title: {
                    display: true,
                    text: 'Number of Correct Questions'
                }
            },
            y: {  // This is now the category axis
                stacked: true
            }
        },
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'How Did You Perform?',
                position: 'top',
                align: 'center',
                color: 'black',  // Set the title color to black
                font: {
                    size: 24 // Customize the font size
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        const result = tooltipItem.raw;
                        const scamType = tooltipItem.label;
                        const plural = result === 1 ? 'question' : 'questions';
                        return `You scored ${result} ${scamType} ${plural} correctly`;
                    }
                }
            }
        }
    }
});






    }

    // Add event listeners
    answerButtons.forEach(button => {
        button.addEventListener('click', () => handleAnswer(button.textContent === 'YES'));
    });

    backButton.addEventListener('click', handleBack); // Add event listener to back button

    fetchQuestions();
});
