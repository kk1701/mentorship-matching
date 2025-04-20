create database mentorship_matching;

use mentorship_matching;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('mentor', 'mentee', 'both') NOT NULL,
    title VARCHAR(100),
    bio TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    meeting_frequency ENUM('weekly', 'biweekly', 'monthly', 'as_needed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    availability ENUM('weekday_mornings', 'weekday_afternoons', 'weekday_evenings', 'weekends') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, availability)
);

CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, skill_name)
);

CREATE TABLE interests (
    interest_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    interest_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, interest_name)
);

CREATE TABLE connection_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (sender_id != receiver_id)
);

CREATE TABLE connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    request_id INT, -- References the original request
    connected_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_meeting TIMESTAMP,
    next_meeting TIMESTAMP,
    meeting_frequency ENUM('weekly', 'biweekly', 'monthly', 'as_needed'),
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    FOREIGN KEY (mentor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES connection_requests(request_id) ON DELETE SET NULL,
    CHECK (mentor_id != mentee_id)
);

-- INDEXES
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Connection requests indexes
CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Connections table indexes
CREATE INDEX idx_connections_mentor ON connections(mentor_id);
CREATE INDEX idx_connections_mentee ON connections(mentee_id);
CREATE INDEX idx_connections_status ON connections(status);
