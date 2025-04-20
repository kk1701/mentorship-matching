document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (window.location.pathname.includes('discover.html')) {
        loadDiscoveryResults();
        setupFilterHandlers();
    }
});

function loadDiscoveryResults(filters = {}) {
    const discoveryResults = document.getElementById('discoveryResults');
    if (!discoveryResults) return;
    
    // Filter users (excluding current user)
    let results = usersDB.filter(user => user.id !== currentUser.id);
    
    // Apply filters
    if (filters.role && filters.role !== 'all') {
        results = results.filter(user => user.role === filters.role || user.role === 'both');
    }
    
    if (filters.skills) {
        const searchTerms = filters.skills.toLowerCase().split(',').map(term => term.trim());
        results = results.filter(user => {
            const allSkills = [...(user.skills || []), ...(user.interests || [])].map(s => s.toLowerCase());
            return searchTerms.some(term => allSkills.some(skill => skill.includes(term)));
        });
    }
    
    if (filters.availability && filters.availability !== 'any') {
        results = results.filter(user => 
            user.availability && user.availability.includes(filters.availability)
        );
    }
    
    // Display results
    discoveryResults.innerHTML = '';
    
    if (results.length === 0) {
        discoveryResults.innerHTML = '<p>No users found matching your criteria.</p>';
        return;
    }
    
    results.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'profile-card';
        
        const connectionStatus = getConnectionStatus(user.id);
        
        userCard.innerHTML = `
            <div class="profile-card-header">
                <h3 class="profile-card-name">${user.name}</h3>
                <p class="profile-card-role">${formatRole(user.role)}</p>
            </div>
            <div class="profile-card-body">
                ${user.title ? `<p><strong>${user.title}</strong></p>` : ''}
                ${user.bio ? `<p class="profile-card-bio">${user.bio}</p>` : ''}
                
                ${user.skills?.length ? `
                <div>
                    <p><strong>Skills:</strong></p>
                    <div class="profile-card-skills">
                        ${user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${user.interests?.length ? `
                <div>
                    <p><strong>Interests:</strong></p>
                    <div class="profile-card-skills">
                        ${user.interests.map(interest => `<span class="skill-tag">${interest}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="profile-card-actions">
                    ${connectionStatus === 'connected' ? `
                        <button class="btn-secondary" disabled>Connected</button>
                    ` : connectionStatus === 'requested' ? `
                        <button class="btn btn-secondary" disabled>Request Sent</button>
                    ` : connectionStatus === 'pending' ? `
                        <button class="btn btn-primary" data-user-id="${user.id}" data-action="accept">Accept</button>
                        <button class="btn btn-secondary" data-user-id="${user.id}" data-action="decline">Decline</button>
                    ` : `
                        <button class="btn btn-primary" data-user-id="${user.id}" data-action="connect">Connect</button>
                    `}
                </div>
            </div>
        `;
        
        discoveryResults.appendChild(userCard);
    });
    
    // Add event listeners to buttons
    discoveryResults.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.getAttribute('data-user-id');
            const action = e.target.getAttribute('data-action');
            
            if (action === 'connect') {
                sendConnectionRequest(userId);
            } else if (action === 'accept') {
                acceptConnectionRequest(userId);
            } else if (action === 'decline') {
                declineConnectionRequest(userId);
            }
        });
    });
}

function setupFilterHandlers() {
    document.getElementById('applyFilters')?.addEventListener('click', () => {
        const filters = {
            role: document.getElementById('filterRole').value,
            skills: document.getElementById('filterSkills').value,
            availability: document.getElementById('filterAvailability').value
        };
        
        loadDiscoveryResults(filters);
    });
    
    document.getElementById('resetFilters')?.addEventListener('click', () => {
        document.getElementById('filterRole').value = 'all';
        document.getElementById('filterSkills').value = '';
        document.getElementById('filterAvailability').value = 'any';
        loadDiscoveryResults({});
    });
}

function formatRole(role) {
    switch (role) {
        case 'mentor': return 'Mentor';
        case 'mentee': return 'Mentee';
        case 'both': return 'Mentor & Mentee';
        default: return '';
    }
}

function getConnectionStatus(targetUserId) {
    const user = usersDB.find(u => u.id === currentUser.id);
    if (!user) return 'none';
    
    // Check if already connected
    if (user.connections.some(conn => conn.userId === targetUserId)) {
        return 'connected';
    }
    
    // Check if request already sent
    if (user.sentRequests.some(req => req.userId === targetUserId)) {
        return 'requested';
    }
    
    // Check if request received
    if (user.receivedRequests.some(req => req.userId === targetUserId)) {
        return 'pending';
    }
    
    return 'none';
}

function sendConnectionRequest(targetUserId) {
    const targetUserIndex = usersDB.findIndex(u => u.id === targetUserId);
    const currentUserIndex = usersDB.findIndex(u => u.id === currentUser.id);
    
    if (targetUserIndex === -1 || currentUserIndex === -1) return;
    
    const request = {
        requestId: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Add to target user's received requests
    usersDB[targetUserIndex].receivedRequests.push(request);
    
    // Add to current user's sent requests
    usersDB[currentUserIndex].sentRequests.push({
        ...request,
        userId: targetUserId,
        userName: usersDB[targetUserIndex].name
    });
    
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    loadDiscoveryResults(); // Refresh results
}


// function acceptConnectionRequest(requestUserId) {
    
// }

// function declineConnectionRequest(requestUserId) {

// }