from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Auth Schemas
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(..., min_length=2, max_length=100)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Profile Schemas
class ProfileResponse(BaseModel):
    display_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)


class UserMeResponse(BaseModel):
    id: int
    email: str
    profile: Optional[ProfileResponse] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Matches Schemas
class MatchResponse(BaseModel):
    id: int
    external_id: Optional[str] = None
    opponent: str
    competition: str
    kickoff_at: datetime
    status: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    is_home: str

    model_config = ConfigDict(from_attributes=True)


class MatchDetailResponse(MatchResponse):
    venue: str = "Old Trafford"
    referee: Optional[str] = None
    attendance: Optional[int] = None


# News Schemas
class NewsResponse(BaseModel):
    id: int
    external_id: Optional[str] = None
    title: str
    summary: str
    source: str
    published_at: datetime
    url: Optional[str] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Community Schemas
class ReactionResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReactionCreateRequest(BaseModel):
    type: str = Field("like", description="Type of reaction: like, red, love, fire")


class CommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int = Field(alias="user_id")
    author_name: Optional[str] = None
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class PostResponse(BaseModel):
    id: int
    author_id: int = Field(alias="user_id")
    author_name: Optional[str] = None
    content: str
    match_id: Optional[int] = None
    created_at: datetime
    comments_count: int = 0
    reactions_count: int = 0

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    match_id: Optional[int] = None
