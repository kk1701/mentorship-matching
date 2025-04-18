const usersDB = JSON.parse(localStorage.getItem('mentorshipUsers')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Redirect to dashboard if already logged in
    if (currentUser && !['index.html', 'register.html'].includes(window.location.pathname.split('/').pop())) {
        // Allow staying on current page
    } else if (currentUser && ['index.html', 'register.html'].includes(window.location.pathname.split('/').pop())) {
        window.location.href = 'dashboard.html';
    } else if (!currentUser && !['index.html', 'register.html'].includes(window.location.pathname.split('/').pop())) {
        window.location.href = 'index.html';
    }
    
    // Update dashboard with user info
    if (window.location.pathname.includes('dashboard.html') && currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = `You're logged in as ${currentUser.role}`;
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const user = usersDB.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('loginError').textContent = 'Invalid email or password';
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;
        
        if (password !== confirmPassword) {
            document.getElementById('registerError').textContent = 'Passwords do not match';
            return;
        }
        
        if (usersDB.some(u => u.email === email)) {
            document.getElementById('registerError').textContent = 'Email already registered';
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role,
            profileComplete: false,
            skills: [],
            interests: [],
            connections: [],
            sentRequests: [],
            receivedRequests: []
        };
        
        usersDB.push(newUser);
        localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
        
        // Auto-login
        currentUser = newUser;
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
        window.location.href = 'profile.html';
    });
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}