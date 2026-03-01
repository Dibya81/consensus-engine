BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 552221ea3a5a

CREATE TABLE users (
    id VARCHAR NOT NULL, 
    firebase_uid VARCHAR(128) NOT NULL, 
    email VARCHAR(255), 
    display_name VARCHAR(255), 
    avatar_url TEXT, 
    role VARCHAR(20), 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    last_active TIMESTAMP WITHOUT TIME ZONE, 
    is_deleted BOOLEAN, 
    PRIMARY KEY (id), 
    UNIQUE (email), 
    UNIQUE (firebase_uid)
);

CREATE TABLE achievements (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    badge_type VARCHAR(50) NOT NULL, 
    earned_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE code_snippets (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    title VARCHAR(255), 
    code TEXT NOT NULL, 
    language VARCHAR(20) NOT NULL, 
    last_review JSON, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE conversations (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    title VARCHAR(255), 
    preview_text TEXT, 
    last_message_at TIMESTAMP WITHOUT TIME ZONE, 
    message_count INTEGER, 
    ai_status_errors VARCHAR(255), 
    context JSON, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE notes (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    title VARCHAR(500) NOT NULL, 
    content TEXT NOT NULL, 
    summary TEXT, 
    summary_consensus_score FLOAT, 
    tags JSON, 
    is_pinned BOOLEAN, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE posts (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    title VARCHAR(500) NOT NULL, 
    content TEXT NOT NULL, 
    tags JSON, 
    vote_count INTEGER, 
    is_verified BOOLEAN, 
    verified_answer TEXT, 
    verified_consensus_score FLOAT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE queries (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    query_hash VARCHAR(64) NOT NULL, 
    consensus_score FLOAT, 
    verification_status VARCHAR(20), 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE roadmaps (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    career_goal TEXT, 
    roadmap_content JSON NOT NULL, 
    consensus_score FLOAT, 
    verification_status VARCHAR(20), 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE shared_links (
    id VARCHAR NOT NULL, 
    slug VARCHAR(12) NOT NULL, 
    user_id VARCHAR NOT NULL, 
    content_type VARCHAR(20) NOT NULL, 
    content_id VARCHAR NOT NULL, 
    expires_at TIMESTAMP WITHOUT TIME ZONE, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    UNIQUE (slug)
);

CREATE TABLE user_preferences (
    user_id VARCHAR NOT NULL, 
    theme VARCHAR(10), 
    language VARCHAR(10), 
    notifications_enabled BOOLEAN, 
    default_code_language VARCHAR(20), 
    voice_enabled BOOLEAN, 
    preferences JSON, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    total_xp INTEGER, 
    total_study_time_minutes INTEGER, 
    modules_completed INTEGER, 
    current_streak_days INTEGER, 
    longest_streak_days INTEGER, 
    last_activity_date DATE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    UNIQUE (user_id)
);

CREATE TABLE comments (
    id VARCHAR NOT NULL, 
    post_id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    content TEXT NOT NULL, 
    vote_count INTEGER, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(post_id) REFERENCES posts (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE execution_logs (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    snippet_id VARCHAR, 
    language VARCHAR(20) NOT NULL, 
    code TEXT NOT NULL, 
    stdout TEXT, 
    stderr TEXT, 
    exit_code INTEGER, 
    execution_time_ms INTEGER, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(snippet_id) REFERENCES code_snippets (id) ON DELETE SET NULL, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE verification_logs (
    id VARCHAR NOT NULL, 
    query_id VARCHAR NOT NULL, 
    model_name VARCHAR(50), 
    provider VARCHAR(50), 
    response_hash VARCHAR(64), 
    latency_ms INTEGER, 
    success BOOLEAN, 
    error_message TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(query_id) REFERENCES queries (id) ON DELETE CASCADE
);

INSERT INTO alembic_version (version_num) VALUES ('552221ea3a5a') RETURNING alembic_version.version_num;

COMMIT;

