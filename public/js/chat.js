// Chat Interface Handler
const API_URL = 'http://localhost:3000';

// Check authentication
const authToken = checkAuth();

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const logoutBtn = document.getElementById('logoutBtn');

// State
let conversationHistory = [];
let isWaitingForResponse = false;
let currentAssessment = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
});

// Event Listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    clearBtn.addEventListener('click', clearChat);
    logoutBtn.addEventListener('click', logout);

    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            messageInput.value = btn.dataset.action;
            sendMessage();
        });
    });
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isWaitingForResponse) return;

    // Add user message to UI
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Show typing indicator
    const typingId = showTypingIndicator();
    isWaitingForResponse = true;
    sendBtn.disabled = true;

    try {
        // Send to backend
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                text: message,
                history: conversationHistory.slice(-10) // Send last 10 messages
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Handle response
        if (data.crisis) {
            handleCrisisResponse(data);
        } else if (data.assessmentSuggestion) {
            handleAssessmentSuggestion(data);
        } else if (data.response) {
            addMessage(data.response, 'ai');
        }

        // Update conversation history
        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: data.response || data.message });

    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        addMessage("I'm having trouble connecting right now. Please try again in a moment.", 'ai');
    } finally {
        isWaitingForResponse = false;
        sendBtn.disabled = false;
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}`;

    const messageBubble = document.createElement('div');
    messageBubble.className = `message message-${sender}`;
    messageBubble.textContent = text;

    messageContainer.appendChild(messageBubble);
    chatMessages.appendChild(messageContainer);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const container = document.createElement('div');
    container.id = id;
    container.className = 'message-container ai';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    container.appendChild(typingDiv);
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return id;
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// Handle crisis response
function handleCrisisResponse(data) {
    const crisisMessage = document.createElement('div');
    crisisMessage.className = 'alert alert-warning';
    crisisMessage.style.margin = '10px 0';

    let content = `<strong>🚨 ${data.message}</strong><br><br>`;
    if (data.resources) {
        content += '<strong>Emergency Resources:</strong><br>';
        data.resources.forEach(resource => {
            content += `📞 ${resource.name}: ${resource.contact}<br>`;
        });
    }

    crisisMessage.innerHTML = content;

    const container = document.createElement('div');
    container.className = 'message-container ai';
    container.appendChild(crisisMessage);
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle assessment suggestion
function handleAssessmentSuggestion(data) {
    addMessage(data.response, 'ai');

    const assessmentCard = document.createElement('div');
    assessmentCard.className = 'assessment-card';

    const title = document.createElement('h3');
    title.textContent = `📋 ${data.assessmentSuggestion.name}`;

    const description = document.createElement('p');
    description.textContent = data.assessmentSuggestion.description;

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '10px';
    btnContainer.style.marginTop = '15px';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary';
    startBtn.textContent = 'Start Assessment';
    startBtn.onclick = () => startAssessment(data.assessmentSuggestion.type);

    const declineBtn = document.createElement('button');
    declineBtn.className = 'btn btn-outline';
    declineBtn.textContent = 'Maybe Later';
    declineBtn.onclick = () => {
        assessmentCard.remove();
        addMessage("That's okay. I'm here whenever you're ready to talk or take an assessment.", 'ai');
    };

    btnContainer.appendChild(startBtn);
    btnContainer.appendChild(declineBtn);

    assessmentCard.appendChild(title);
    assessmentCard.appendChild(description);
    assessmentCard.appendChild(btnContainer);

    chatMessages.appendChild(assessmentCard);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start assessment
async function startAssessment(type) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                action: 'start_assessment',
                type: type
            })
        });

        const data = await response.json();
        currentAssessment = data.assessment;

        displayAssessmentQuestion(0);
    } catch (error) {
        console.error('Error starting assessment:', error);
        addMessage("Sorry, I couldn't load the assessment. Please try again.", 'ai');
    }
}

// Display assessment question
function displayAssessmentQuestion(questionIndex) {
    if (!currentAssessment || questionIndex >= currentAssessment.questions.length) {
        submitAssessment();
        return;
    }

    const question = currentAssessment.questions[questionIndex];

    const questionCard = document.createElement('div');
    questionCard.className = 'assessment-card';

    const questionText = document.createElement('h4');
    questionText.textContent = `Question ${questionIndex + 1}/${currentAssessment.questions.length}`;

    const questionContent = document.createElement('p');
    questionContent.textContent = question.text;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'assessment-options';

    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = `${option.label} - ${option.text}`;
        optionBtn.onclick = () => {
            // Store answer
            if (!currentAssessment.answers) {
                currentAssessment.answers = {};
            }
            currentAssessment.answers[question.id] = option.value;

            // Remove question card
            questionCard.remove();

            // Show next question
            displayAssessmentQuestion(questionIndex + 1);
        };
        optionsContainer.appendChild(optionBtn);
    });

    questionCard.appendChild(questionText);
    questionCard.appendChild(questionContent);
    questionCard.appendChild(optionsContainer);

    chatMessages.appendChild(questionCard);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Submit assessment
async function submitAssessment() {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                action: 'submit_assessment',
                type: currentAssessment.type,
                answers: currentAssessment.answers
            })
        });

        const data = await response.json();

        // Show results
        const resultCard = document.createElement('div');
        resultCard.className = 'alert alert-info';
        resultCard.innerHTML = `
            <h3>Assessment Complete</h3>
            <p><strong>Score:</strong> ${data.score}/${data.maxScore}</p>
            <p><strong>Severity:</strong> ${data.severity}</p>
            <p>${data.interpretation}</p>
        `;

        chatMessages.appendChild(resultCard);

        // Add AI response
        addMessage(data.response, 'ai');

        currentAssessment = null;
    } catch (error) {
        console.error('Error submitting assessment:', error);
        addMessage("Sorry, I couldn't process your assessment. Please try again.", 'ai');
    }
}

// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatMessages.innerHTML = `
            <div class="message-container ai">
                <div class="message message-ai">
                    👋 Hello! I'm here to support you. How are you feeling today?
                </div>
            </div>
        `;
        conversationHistory = [];
    }
}
