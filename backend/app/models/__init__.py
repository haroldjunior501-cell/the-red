from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="profile")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), unique=True, index=True, nullable=True)
    opponent = Column(String(150), nullable=False)
    competition = Column(String(150), nullable=False)
    kickoff_at = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(50), default="SCHEDULED", nullable=False)  # SCHEDULED, LIVE, FINISHED
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    is_home = Column(String(10), default="HOME", nullable=False) # HOME or AWAY

    posts = relationship("Post", back_populates="match")


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), unique=True, index=True, nullable=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    published_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="SET NULL"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    author = relationship("User", back_populates="posts")
    match = relationship("Match", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # like, red, love, fire
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")
