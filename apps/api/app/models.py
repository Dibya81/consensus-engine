"""SQLAlchemy ORM models — all tables for the integrated platform."""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, Date,
    ForeignKey, SmallInteger, JSON, ARRAY,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def _uuid():
    return str(uuid.uuid4())


# ─── Users ────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=_uuid)
    firebase_uid = Column(String(128), unique=True, nullable=False)
    email = Column(String(255), unique=True)
    display_name = Column(String(255))
    avatar_url = Column(Text)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    code_snippets = relationship("CodeSnippet", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


# ─── Conversations (Mentor Chat) ─────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))
    preview_text = Column(Text)
    last_message_at = Column(DateTime)
    message_count = Column(Integer, default=0)
    ai_status_errors = Column(String(255))
    context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")


# ─── Notes ────────────────────────────────────────────────────────────
class Note(Base):
    __tablename__ = "notes"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    summary_consensus_score = Column(Float)
    tags = Column(JSON, default=list)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notes")


# ─── Code ─────────────────────────────────────────────────────────────
class CodeSnippet(Base):
    __tablename__ = "code_snippets"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))
    code = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)
    last_review = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="code_snippets")
    executions = relationship("ExecutionLog", back_populates="snippet", cascade="all, delete-orphan")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    snippet_id = Column(String, ForeignKey("code_snippets.id", ondelete="SET NULL"), nullable=True)
    language = Column(String(20), nullable=False)
    code = Column(Text, nullable=False)
    stdout = Column(Text)
    stderr = Column(Text)
    exit_code = Column(Integer)
    execution_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    snippet = relationship("CodeSnippet", back_populates="executions")


# ─── Community ────────────────────────────────────────────────────────
class Post(Base):
    __tablename__ = "posts"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    vote_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    verified_answer = Column(Text)
    verified_consensus_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan",
                            order_by="Comment.created_at")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(String, primary_key=True, default=_uuid)
    post_id = Column(String, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    vote_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="comments")


# ─── Progress ─────────────────────────────────────────────────────────
class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    total_study_time_minutes = Column(Integer, default=0)
    modules_completed = Column(Integer, default=0)
    current_streak_days = Column(Integer, default=0)
    longest_streak_days = Column(Integer, default=0)
    last_activity_date = Column(Date)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress")


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_type = Column(String(50), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)


# ─── Career ───────────────────────────────────────────────────────────
class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    career_goal = Column(Text)
    roadmap_content = Column(JSON, nullable=False)
    consensus_score = Column(Float)
    verification_status = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Share ────────────────────────────────────────────────────────────
class SharedLink(Base):
    __tablename__ = "shared_links"
    id = Column(String, primary_key=True, default=_uuid)
    slug = Column(String(12), unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_type = Column(String(20), nullable=False)
    content_id = Column(String, nullable=False)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Preferences ─────────────────────────────────────────────────────
class UserPreference(Base):
    __tablename__ = "user_preferences"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    theme = Column(String(10), default="dark")
    language = Column(String(10), default="en")
    notifications_enabled = Column(Boolean, default=True)
    default_code_language = Column(String(20), default="python")
    voice_enabled = Column(Boolean, default=True)
    preferences = Column(JSON, default=dict)

    user = relationship("User", back_populates="preferences")


# ─── Query History & Verification Logs (from design.md) ──────────────
class Query(Base):
    __tablename__ = "queries"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    query_hash = Column(String(64), nullable=False)
    consensus_score = Column(Float)
    verification_status = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    verification_logs = relationship("VerificationLog", back_populates="query", cascade="all, delete-orphan")


class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(String, primary_key=True, default=_uuid)
    query_id = Column(String, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    model_name = Column(String(50))
    provider = Column(String(50))
    response_hash = Column(String(64))
    latency_ms = Column(Integer)
    success = Column(Boolean)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    query = relationship("Query", back_populates="verification_logs")
