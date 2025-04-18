document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load profile data if on profile page
    if (window.location.pathname.includes('profile.html')) {
        loadProfileData();
        setupSkillHandlers();
    }
});

function loadProfileData() {
    const user = usersDB.find(u => u.id === currentUser.id);
    
    if (user) {
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profileRole').value = user.role || 'mentor';
        document.getElementById('profileTitle').value = user.title || '';
        document.getElementById('profileBio').value = user.bio || '';
        
        // Skills & Interests
        renderSkills(user.skills || [], 'mentorSkills');
        renderSkills(user.interests || [], 'menteeInterests');
        
        // Availability
        if (user.availability) {
            user.availability.forEach(avail => {
                const checkbox = document.querySelector(`input[name="availability"][value="${avail}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (user.meetingFrequency) {
            document.getElementById('meetingFrequency').value = user.meetingFrequency;
        }
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile();
        });
    }
}

function renderSkills(skills, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'tag';
        skillElement.innerHTML = `
            ${skill}
            <span class="tag-remove" data-skill="${skill}">&times;</span>
        `;
        container.appendChild(skillElement);
    });
    
    // Add remove event listeners
    container.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const skillToRemove = e.target.getAttribute('data-skill');
            removeSkill(skillToRemove, containerId);
        });
    });
}

function setupSkillHandlers() {
    // Mentor skills
    document.getElementById('addMentorSkill')?.addEventListener('click', () => {
        const newSkill = document.getElementById('newMentorSkill').value.trim();
        if (newSkill) {
            addSkill(newSkill, 'mentorSkills');
            document.getElementById('newMentorSkill').value = '';
        }
    });
    
    // Mentee interests
    document.getElementById('addMenteeInterest')?.addEventListener('click', () => {
        const newInterest = document.getElementById('newMenteeInterest').value.trim();
        if (newInterest) {
            addSkill(newInterest, 'menteeInterests');
            document.getElementById('newMenteeInterest').value = '';
        }
    });
}

function addSkill(skill, containerId) {
    const user = usersDB.find(u => u.id === currentUser.id);
    if (!user) return;
    
    const skillArray = containerId === 'mentorSkills' ? user.skills : user.interests;
    
    if (!skillArray.includes(skill)) {
        skillArray.push(skill);
        localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
        renderSkills(skillArray, containerId);
    }
}

function removeSkill(skill, containerId) {
    const user = usersDB.find(u => u.id === currentUser.id);
    if (!user) return;
    
    const skillArray = containerId === 'mentorSkills' ? user.skills : user.interests;
    const index = skillArray.indexOf(skill);
    
    if (index !== -1) {
        skillArray.splice(index, 1);
        localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
        renderSkills(skillArray, containerId);
    }
}

function saveProfile() {
    const userIndex = usersDB.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    const user = usersDB[userIndex];
    
    user.name = document.getElementById('profileName').value;
    user.role = document.getElementById('profileRole').value;
    user.title = document.getElementById('profileTitle').value;
    user.bio = document.getElementById('profileBio').value;
    
    const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
    user.availability = Array.from(availabilityCheckboxes).map(cb => cb.value);
    
    user.meetingFrequency = document.getElementById('meetingFrequency').value;
    
    user.profileComplete = true;
    
    // Update in DB
    usersDB[userIndex] = user;
    localStorage.setItem('mentorshipUsers', JSON.stringify(usersDB));
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Show success message
    document.getElementById('profileSuccess').textContent = 'Profile saved successfully!';
    setTimeout(() => {
        document.getElementById('profileSuccess').textContent = '';
    }, 3000);
}