// Authentication Handler
const API_URL = 'http://localhost:3000';

// Mock token for demo purposes
const DEMO_TOKEN = 'demo-token-' + Date.now();

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // For demo purposes, accept any credentials
        // In production, this would validate against the backend
        localStorage.setItem('authToken', DEMO_TOKEN);
        localStorage.setItem('userEmail', email);

        // Redirect to chat
        window.location.href = 'chat.html';
    });
}

// Guest Login Handler
const guestBtn = document.getElementById('guestBtn');
if (guestBtn) {
    guestBtn.addEventListener('click', () => {
        localStorage.setItem('authToken', DEMO_TOKEN);
        localStorage.setItem('userEmail', 'guest@demo.com');
        window.location.href = 'chat.html';
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // For demo purposes, create account directly
        localStorage.setItem('authToken', DEMO_TOKEN);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);

        // Redirect to chat
        window.location.href = 'chat.html';
    });
}

// Check if user is authenticated (for protected pages)
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}
