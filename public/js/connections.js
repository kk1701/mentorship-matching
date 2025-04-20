document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (window.location.pathname.includes('connections.html')) {
        setupTabHandlers();
        loadConnections();
    }
});

function setupTabHandlers() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId + 'Connections').classList.add('active');
        });
    });
}

function loadConnections() {
    const user = usersDB.find(u => u.id === currentUser.id);
    if (!user) return;
    
    // Active Connections
    const activeConnectionsList = document.getElementById('activeConnectionsList');
    if (activeConnectionsList) {
        activeConnectionsList.innerHTML = user.connections.length ? '' : '<p>No active connections yet.</p>';
        
        user.connections.forEach(connection => {
            const connectionUser = usersDB.find(u => u.id === connection.userId);
            if (!connectionUser) return;
            
            const connectionItem = document.createElement('div');
            connectionItem.className = 'connection-item';
            connectionItem.innerHTML = `
                <div class="connection-info">
                    <div class="connection-avatar">${connectionUser.name.charAt(0)}</div>
                    <div class="connection-details">
                        <h3>${connectionUser.name}</h3>
                        <p>${formatRole(connectionUser.role)}</p>
                    </div>
                </div>
                <div class="connection-actions">
                    <button class="btn-secondary">Message</button>
                    <button class="btn-secondary" data-user-id="${connectionUser.id}" data-action="disconnect">Disconnect</button>
                </div>
            `;
            
            activeConnectionsList.appendChild(connectionItem);
        });
    }
    
    // Pending Requests
    const requestsList = document.getElementById('requestsList');
    if (requestsList) {
        requestsList.innerHTML = user.receivedRequests.length ? '' : '<p>No pending requests.</p>';
        
        user.receivedRequests.forEach(request => {
            const requestUser = usersDB.find(u => u.id === request.userId);
            if (!requestUser) return;
            
            const requestItem = document.createElement('div');
            requestItem.className = 'connection-item';
            requestItem.innerHTML = `
                <div class="connection-info">
                    <div class="connection-avatar">${requestUser.name.charAt(0)}</div>
                    <div class="connection-details">
                        <h3>${requestUser.name}</h3>
                        <p>${formatRole(requestUser.role)}</p>
                        <p><small>Requested on ${new Date(request.timestamp).toLocaleDateString()}</small></p>
                    </div>
                </div>
                <div class="connection-actions">
                    <button class="btn-primary" data-request-id="${request.requestId}" data-action="accept">Accept</button>
                    <button class="btn-secondary" data-request-id="${request.requestId}" data-action="decline">Decline</button>
                </div>
            `;
            
            requestsList.appendChild(requestItem);
        });
    }
    
    // Sent Requests
    const sentRequestsList = document.getElementById('sentRequestsList');
    if (sentRequestsList) {
        sentRequestsList.innerHTML = user.sentRequests.length ? '' : '<p>No sent requests.</p>';
        
        user.sentRequests.forEach(request => {
            const requestUser = usersDB.find(u => u.id === request.userId);
            if (!requestUser) return;
            
            const requestItem = document.createElement('div');
            requestItem.className = 'connection-item';
            requestItem.innerHTML = `
                <div class="connection-info">
                    <div class="connection-avatar">${requestUser.name.charAt(0)}</div>
                    <div class="connection-details">
                        <h3>${requestUser.name}</h3>
                        <p>${formatRole(requestUser.role)}</p>
                        <p><small>Sent on ${new Date(request.timestamp).toLocaleDateString()}</small></p>
                    </div>
                </div>
                <div class="connection-actions">
                    <button class="btn-secondary" data-request-id="${request.requestId}" data-action="cancel">Cancel</button>
                </div>
            `;
            
            sentRequestsList.appendChild(requestItem);
        });
    }
    
    // Add event listeners to all action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', handleConnectionAction);
    });
}

function handleConnectionAction(e) {
    const action = e.target.getAttribute('data-action');
    const requestId = e.target.getAttribute('data-request-id');
    const userId = e.target.getAttribute('data-user-id');
    
    if (action === 'accept') {
        acceptConnectionRequest(requestId);
    } else if (action === 'decline') {
        declineConnectionRequest(requestId);
    } else if (action === 'cancel') {
        cancelConnectionRequest(requestId);
    } else if (action === 'disconnect') {
        disconnectUser(userId);
    }
}

function acceptConnectionRequest(requestId) {
    // Find the request in current user's receivedRequests
    const currentUserIndex = usersDB.findIndex(u => u.id === currentUser.id);
    if (currentUserIndex === -1) return;
    
    const requestIndex = usersDB[currentUserIndex].receivedRequests.findIndex(req => req.requestId === requestId);
    if (requestIndex === -1) return;
    
    const request = usersDB[currentUserIndex].receivedRequests[requestIndex];
    
    // Find the sender user
    const senderUserIndex = usersDB.findIndex(u => u.id === request.userId);
    if (senderUserIndex === -1) return;
    
    // Find the corresponding sent request
    const sentRequestIndex = usersDB[senderUserIndex].sentRequests.findIndex(req => req.requestId === requestId);
    if (sentRequestIndex === -1) return;
    
    // Create connection for both users
    const connection = {
        userId: request.userId,
        userName: usersDB[senderUserIndex].name,
        connectedSince: new Date().toISOString()
    };
    
    const reverseConnection = {
        userId: currentUser.id,
        userName: currentUser.name,
        connectedSince: new Date().toISOString()
    };
    
    // Add to connections
    usersDB[currentUserIndex].connections.push(connection);
    usersDB[senderUserIndex].connections.push(reverseConnection);
    
    // Remove from requests
    usersDB[currentUserIndex].receivedRequests.splice(requestIndex, 1);
    usersDB[senderUserIndex].sentRequests.splice(sentRequestIndex, 1);
    
    // Update storage
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    currentUser = usersDB[currentUserIndex];
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Reload connections
    loadConnections();
}

function declineConnectionRequest(requestId) {
    const currentUserIndex = usersDB.findIndex(u => u.id === currentUser.id);
    if (currentUserIndex === -1) return;

    // Find the request in current user's receivedRequests
    const requestIndex = usersDB[currentUserIndex].receivedRequests.findIndex(
        req => req.requestId === requestId
    );
    
    if (requestIndex === -1) return;

    const request = usersDB[currentUserIndex].receivedRequests[requestIndex];
    const senderUserIndex = usersDB.findIndex(u => u.id === request.userId);
    if (senderUserIndex === -1) return;

    // Find the corresponding sent request in sender's sentRequests
    const sentRequestIndex = usersDB[senderUserIndex].sentRequests.findIndex(
        req => req.requestId === requestId
    );

    if (sentRequestIndex === -1) return;

    // Remove from both users' request lists
    usersDB[currentUserIndex].receivedRequests.splice(requestIndex, 1);
    usersDB[senderUserIndex].sentRequests.splice(sentRequestIndex, 1);

    // Update database
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    
    // Update current user in session
    currentUser = usersDB[currentUserIndex];
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Reload connections
    loadConnections();
}

function cancelConnectionRequest(requestId) {
    const currentUserIndex = usersDB.findIndex(u => u.id === currentUser.id);
    if (currentUserIndex === -1) return;

    // Find the request in current user's sentRequests
    const sentRequestIndex = usersDB[currentUserIndex].sentRequests.findIndex(
        req => req.requestId === requestId
    );
    
    if (sentRequestIndex === -1) return;

    const request = usersDB[currentUserIndex].sentRequests[sentRequestIndex];
    const receiverUserIndex = usersDB.findIndex(u => u.id === request.userId);
    if (receiverUserIndex === -1) return;

    // Find the corresponding received request in receiver's receivedRequests
    const receivedRequestIndex = usersDB[receiverUserIndex].receivedRequests.findIndex(
        req => req.requestId === requestId
    );

    if (receivedRequestIndex === -1) return;

    // Remove from both users' request lists
    usersDB[currentUserIndex].sentRequests.splice(sentRequestIndex, 1);
    usersDB[receiverUserIndex].receivedRequests.splice(receivedRequestIndex, 1);

    // Update database
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    
    // Update current user in session
    currentUser = usersDB[currentUserIndex];
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Reload connections
    loadConnections();
}

function disconnectUser(targetUserId) {
    const currentUserIndex = usersDB.findIndex(u => u.id === currentUser.id);
    const targetUserIndex = usersDB.findIndex(u => u.id === targetUserId);
    
    if (currentUserIndex === -1 || targetUserIndex === -1) return;

    // Remove connection from current user's connections
    const currentUserConnIndex = usersDB[currentUserIndex].connections.findIndex(
        conn => conn.userId === targetUserId
    );
    
    if (currentUserConnIndex !== -1) {
        usersDB[currentUserIndex].connections.splice(currentUserConnIndex, 1);
    }

    // Remove connection from target user's connections
    const targetUserConnIndex = usersDB[targetUserIndex].connections.findIndex(
        conn => conn.userId === currentUser.id
    );
    
    if (targetUserConnIndex !== -1) {
        usersDB[targetUserIndex].connections.splice(targetUserConnIndex, 1);
    }

    // Update database
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    
    // Update current user in session
    currentUser = usersDB[currentUserIndex];
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Reload connections
    loadConnections();
}